import { collection, config, fields, singleton } from "@keystatic/core";

type ImageFieldOptions = {
  label: string;
  required?: boolean;
  description?: string;
};

/**
 * The only image-field constructor used by this configuration.
 * A non-empty, field-specific namespace is mandatory so uploads from separate
 * fields can never share a filesystem directory or public URL path.
 */
function imageField(
  namespace: string,
  { label, required = true, description }: ImageFieldOptions,
) {
  if (!namespace.trim()) {
    throw new Error(`A non-empty image namespace is required for ${label}`);
  }

  const options = {
    label,
    description:
      description ??
      `${required ? "Required" : "Optional"} image used for ${label.toLowerCase()} on the website.`,
    directory: `public/images/keystatic/${namespace}`,
    publicPath: `/images/keystatic/${namespace}/`,
    ...(required ? { validation: { isRequired: true as const } } : {}),
  } as Parameters<typeof fields.image>[0];

  return fields.image(options);
}

const plainLabel = (label: string) =>
  label.replace(/^⚠️ Advanced — /, "").toLowerCase();
const text = (label: string, multiline = false, description?: string) =>
  fields.text({
    label,
    description:
      description ?? `Edit the ${plainLabel(label)} shown on the website.`,
    multiline,
    validation: { isRequired: true },
  });
const optionalText = (label: string, multiline = false, description?: string) =>
  fields.text({
    label,
    description:
      description ?? `Optional ${plainLabel(label)} used on the website.`,
    multiline,
  });
const textList = (label: string) =>
  fields.array(text("Text"), {
    label,
    description: `Add, edit, remove, or reorder the ${label.toLowerCase()} shown on the website.`,
  });

const link = (label = "Link") =>
  fields.object(
    {
      label: text("Link Text"),
      href: optionalText(
        "Link Destination",
        false,
        "Enter an internal path such as /menu or a full website address.",
      ),
    },
    { label },
  );

const seo = () =>
  fields.object(
    {
      title: text(
        "Search Result Title",
        false,
        "Title shown in search results. Keep it concise and specific.",
      ),
      description: text(
        "Search Result Description",
        true,
        "Summary shown in search results. Use one clear sentence about this page.",
      ),
    },
    { label: "Search Engine Settings" },
  );

const pageHero = (namespace: string, includeSubheading = true) =>
  fields.object(
    {
      imageSrc: imageField(namespace, { label: "Hero Image" }),
      imageAlt: text(
        "Image Description for Accessibility",
        false,
        "Describe what is visible in the image for screen readers and search engines.",
      ),
      eyebrow: text("Small Section Label"),
      heading: text("Heading"),
      ...(includeSubheading
        ? { subheading: text("Supporting Text", true) }
        : {}),
    },
    { label: "Hero Section" },
  );

const imageCard = (namespace: string, label = "Image Card") =>
  fields.object(
    {
      src: imageField(namespace, { label: "Image" }),
      name: text("Name"),
      alt: text("Image Description for Accessibility"),
    },
    { label },
  );

const hourGroup = (label: string) =>
  fields.array(
    fields.object({
      label: text("Display Label"),
      days: fields.array(text("Day"), { label: "Days" }),
      open: optionalText("Opening Time"),
      close: optionalText("Closing Time"),
      display: optionalText("Display Hours"),
      closed: fields.checkbox({ label: "Closed", defaultValue: false }),
    }),
    { label },
  );

const menuCollection = (
  label: string,
  path: `src/content/${"menuFood" | "menuBrunch" | "menuCocktails"}/*`,
  category: "food" | "brunch" | "cocktails",
  imageNamespace: string,
) =>
  collection({
    label,
    path,
    format: "json",
    slugField: "name",
    columns: ["name", "category"],
    schema: {
      slug: text(
        "⚠️ Advanced — Menu Item Reference",
        false,
        "Connects this item to its stored menu record. Leave unchanged unless your website team asks you to edit it.",
      ),
      category: fields.select({
        label: "⚠️ Advanced — Menu Category",
        description:
          "Connects this item to the correct menu group. Leave unchanged unless your website team asks you to edit it.",
        options: [{ label, value: category }],
        defaultValue: category,
      }),
      name: fields.slug({
        name: { label: "Name", validation: { isRequired: true } },
      }),
      description: text("Description", true),
      image: imageField(imageNamespace, {
        label: "Item Image",
        required: false,
      }),
      alt: text("Image Description for Accessibility"),
    },
  });

export default config({
  storage: { kind: "cloud" },
  cloud: { project: "gph-websites/miss-bs-coconut-club" },

  singletons: {
    siteSettings: singleton({
      label: "Venue / Business Data",
      path: "src/content/siteSettings/site",
      format: "json",
      schema: {
        venueName: text("Venue Name"),
        legalName: text("Legal Name"),
        nicheType: text(
          "⚠️ Advanced — Search Business Type",
          false,
          "Connects the venue to the correct structured-data business type used by search engines. Leave unchanged unless your website team asks you to edit it.",
        ),
        domain: text("Canonical Domain"),
        email: text("Email"),
        social: fields.object(
          {
            tiktok: text("TikTok URL"),
            instagram: text("Instagram URL"),
            facebook: text("Facebook URL"),
            linkedin: text("LinkedIn URL"),
          },
          { label: "Social Profiles" },
        ),
        hours: fields.object(
          {
            general: hourGroup("General Hours"),
            kitchen: hourGroup("Kitchen Hours"),
            brunch: hourGroup("Brunch Hours"),
            happyHour: hourGroup("Happy Hour"),
          },
          { label: "Hours" },
        ),
        address: fields.object(
          {
            streetAddress: text("Street Address"),
            addressLocality: text("City"),
            addressRegion: text("State"),
            postalCode: text("Postal Code"),
          },
          { label: "Address" },
        ),
        phone: text("Phone"),
        coordinates: fields.object(
          {
            latitude: text("Latitude"),
            longitude: text("Longitude"),
          },
          { label: "Coordinates" },
        ),
        priceRange: text("Price Range"),
      },
    }),

    navigation: singleton({
      label: "Navigation",
      path: "src/content/navigation/navigation",
      format: "json",
      schema: {
        main: fields.array(link("Navigation Link"), {
          label: "Main Navigation",
        }),
        ctas: fields.array(
          fields.object({
            label: text("Link Text"),
            href: text(
              "Link Destination",
              false,
              "Enter an internal path such as /menu or a full website address.",
            ),
            external: fields.checkbox({ label: "Open in New Tab" }),
            style: fields.select({
              label: "⚠️ Advanced — Button Style",
              description:
                "Chooses the coded visual treatment for this button. Leave unchanged unless your website team asks you to edit it.",
              options: [
                { label: "Primary", value: "primary" },
                { label: "Secondary", value: "secondary" },
              ],
              defaultValue: "primary",
            }),
          }),
          { label: "Calls to Action" },
        ),
      },
    }),

    footer: singleton({
      label: "Footer",
      path: "src/content/footer/footer",
      format: "json",
      schema: {
        links: fields.array(link("Footer Link"), { label: "Links" }),
        logo: fields.object(
          {
            src: imageField("footer-logo", { label: "Logo" }),
            alt: text("Image Description for Accessibility"),
          },
          { label: "Logo" },
        ),
        description: text("Description", true),
        exploreHeading: text("Explore Heading"),
        visitHeading: text("Visit Heading"),
        brunchHours: text("Brunch Hours"),
        hospitalityLabel: text("Hospitality Group Label"),
        copyrightName: text("Copyright Name"),
        locationLine: text("Location Line"),
        credit: fields.object(
          { label: text("Link Text"), href: text("Link Destination") },
          { label: "Site Credit" },
        ),
      },
    }),

    home: singleton({
      label: "Home",
      path: "src/content/home/home",
      format: "json",
      schema: {
        seo: seo(),
        hero: fields.object(
          {
            imageSrc: imageField("home-hero", { label: "Hero Image" }),
            imageAlt: text("Image Description for Accessibility"),
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            headingAccent: text("Heading Accent"),
            subheading: text("Supporting Text", true),
            ctas: fields.array(link("Hero Link"), { label: "Calls to Action" }),
            stats: fields.array(
              fields.object({
                label: text("Label"),
                value: text("Value"),
                href: optionalText("Link Destination"),
              }),
              { label: "Stats" },
            ),
          },
          { label: "Hero Section" },
        ),
        intro: fields.object(
          {
            imageSrc: imageField("home-intro", { label: "Image" }),
            imageAlt: text("Image Description for Accessibility"),
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            body: textList("Body Paragraphs"),
            ctas: fields.array(link(), { label: "Calls to Action" }),
          },
          { label: "Introduction" },
        ),
        cocktailFeature: fields.object(
          {
            imageSrc: imageField("home-cocktail-feature", { label: "Image" }),
            imageAlt: text("Image Description for Accessibility"),
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            body: text("Body", true),
            cta: link("Call to Action"),
          },
          { label: "Cocktail Feature" },
        ),
        cocktailGrid: fields.array(
          fields.object({
            src: imageField("home-cocktail-grid", { label: "Image" }),
            name: text("Name"),
          }),
          { label: "Cocktail Grid" },
        ),
        happyHour: fields.object(
          {
            imageSrc: imageField("home-happy-hour", { label: "Image" }),
            imageAlt: text("Image Description for Accessibility"),
            heading: text("Heading"),
            bodyPrefix: text("Body Prefix"),
            bodyMiddle: text("Body Middle"),
            offDaysPrefix: text("Off-Days Prefix"),
            ctas: fields.array(link(), { label: "Calls to Action" }),
          },
          { label: "Happy Hour" },
        ),
        brunch: fields.object(
          {
            imageSrc: imageField("home-brunch", { label: "Image" }),
            imageAlt: text("Image Description for Accessibility"),
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            body: text("Body", true),
            ctas: fields.array(link(), { label: "Calls to Action" }),
          },
          { label: "Brunch" },
        ),
        food: fields.object(
          {
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            cta: link("Call to Action"),
            featured: imageCard("home-food-featured", "Featured Dish"),
            grid: fields.array(
              fields.object({
                src: imageField("home-food-grid", { label: "Image" }),
                name: text("Name"),
              }),
              { label: "Food Grid" },
            ),
          },
          { label: "Food" },
        ),
        privateEvents: fields.object(
          {
            imageSrc: imageField("home-private-events", { label: "Image" }),
            imageAlt: text("Image Description for Accessibility"),
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            body: text("Body", true),
            items: textList("Event Types"),
            cta: link("Call to Action"),
          },
          { label: "Private Events" },
        ),
        location: fields.object(
          {
            eyebrow: text("Small Section Label"),
            reservation: link("Reservation Link"),
            directionsLabel: text("Directions Label"),
          },
          { label: "Location" },
        ),
      },
    }),

    brunchPage: singleton({
      label: "Brunch",
      path: "src/content/brunchPage/brunch",
      format: "json",
      schema: {
        seo: seo(),
        hero: pageHero("brunch-page-hero"),
        stats: fields.array(
          fields.object({ value: text("Value"), label: text("Label") }),
          { label: "Stats" },
        ),
        experience: fields.object(
          {
            imageSrc: imageField("brunch-page-experience", { label: "Image" }),
            imageAlt: text("Image Description for Accessibility"),
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            body: textList("Body Paragraphs"),
            ctas: fields.array(link(), { label: "Calls to Action" }),
          },
          { label: "Experience" },
        ),
        food: fields.object(
          {
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            cta: link("Call to Action"),
            grid: fields.array(imageCard("brunch-page-food-grid"), {
              label: "Food Grid",
            }),
          },
          { label: "Food" },
        ),
        cocktails: fields.object(
          {
            imageSrc: imageField("brunch-page-cocktails-feature", {
              label: "Feature Image",
            }),
            imageAlt: text("Image Description for Accessibility"),
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            body: text("Body", true),
            grid: fields.array(
              fields.object({
                src: imageField("brunch-page-cocktails-grid", {
                  label: "Image",
                }),
                alt: text("Image Description for Accessibility"),
              }),
              { label: "Cocktail Grid" },
            ),
          },
          { label: "Cocktails" },
        ),
        faq: fields.object(
          {
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            body: text("Body"),
          },
          { label: "FAQ Introduction" },
        ),
        cta: fields.object(
          {
            imageSrc: imageField("brunch-page-cta", {
              label: "Background Image",
            }),
            imageAlt: text("Image Description for Accessibility"),
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            body: text("Body", true),
            links: fields.array(link(), { label: "Links" }),
          },
          { label: "Call to Action" },
        ),
      },
    }),

    menuPage: singleton({
      label: "Menu Overview",
      path: "src/content/menuPage/menu",
      format: "json",
      schema: {
        seo: seo(),
        hero: pageHero("menu-page-hero"),
        categories: fields.object(
          {
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            order: fields.array(
              text(
                "⚠️ Advanced — Menu Category Reference",
                false,
                "Connects each card to its menu category. Leave unchanged unless your website team asks you to edit it.",
              ),
              { label: "Display Order" },
            ),
          },
          { label: "Categories" },
        ),
        food: fields.object(
          {
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            grid: fields.array(imageCard("menu-page-food-grid"), {
              label: "Food Grid",
            }),
          },
          { label: "Food Section" },
        ),
        cocktails: fields.object(
          {
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            grid: fields.array(imageCard("menu-page-cocktail-grid"), {
              label: "Cocktail Grid",
            }),
          },
          { label: "Cocktail Section" },
        ),
        brunch: fields.object(
          {
            imageSrc: imageField("menu-page-brunch", { label: "Image" }),
            imageAlt: text("Image Description for Accessibility"),
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            body: text("Body", true),
            cta: link("Call to Action"),
          },
          { label: "Brunch Section" },
        ),
      },
    }),

    contactPage: singleton({
      label: "Contact",
      path: "src/content/contactPage/contact",
      format: "json",
      schema: {
        seo: seo(),
        hero: pageHero("contact-page-hero", false),
        cards: fields.array(
          fields.object({
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            body: optionalText("Body", true),
            // Existing cards intentionally use both a token and link objects.
            cta: fields.ignored(),
          }),
          { label: "Contact Cards" },
        ),
        inquiry: fields.object(
          {
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            body: text("Body", true),
            iframeSrc: text("Form URL"),
            iframeTitle: text("Form Title"),
          },
          { label: "Event Inquiry" },
        ),
        hours: fields.object(
          {
            imageSrc: imageField("contact-page-hours", { label: "Image" }),
            imageAlt: text("Image Description for Accessibility"),
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            notes: textList("Notes"),
          },
          { label: "Hours" },
        ),
        social: fields.object(
          {
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            body: text("Body", true),
            links: fields.array(
              fields.object({
                label: text("Link Text"),
                network: text(
                  "⚠️ Advanced — Social Network Reference",
                  false,
                  "Connects this link to the matching social-network icon. Leave unchanged unless your website team asks you to edit it.",
                ),
              }),
              { label: "Social Links" },
            ),
          },
          { label: "Social" },
        ),
      },
    }),

    faqPage: singleton({
      label: "FAQs",
      path: "src/content/faqPage/faq",
      format: "json",
      schema: {
        seo: seo(),
        hero: pageHero("faq-page-hero"),
        list: fields.object(
          { eyebrow: text("Small Section Label"), heading: text("Heading") },
          { label: "FAQ List" },
        ),
        happyHour: fields.object(
          {
            question: text("Question"),
            prefix: text("Answer Prefix"),
            middle: text("Answer Middle"),
            offDaysPrefix: text("Off-Days Prefix"),
            closedAnswer: text("Closed Answer"),
          },
          { label: "Dynamic Happy-Hour FAQ" },
        ),
        cta: fields.object(
          {
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            links: fields.array(link(), { label: "Links" }),
          },
          { label: "Call to Action" },
        ),
      },
    }),

    spacePage: singleton({
      label: "The Space",
      path: "src/content/spacePage/space",
      format: "json",
      schema: {
        seo: seo(),
        hero: pageHero("space-page-hero"),
        sections: fields.array(
          fields.object({
            imageSrc: imageField("space-page-sections", { label: "Image" }),
            imageAlt: text("Image Description for Accessibility"),
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            body: textList("Body Paragraphs"),
            cta: link("Call to Action"),
          }),
          { label: "Space Sections" },
        ),
        taps: fields.object(
          {
            imageSrc: imageField("space-page-taps", { label: "Image" }),
            imageAlt: text("Image Description for Accessibility"),
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            body: text("Body", true),
          },
          { label: "Tap System" },
        ),
        gallery: fields.array(imageCard("space-page-gallery"), {
          label: "Gallery",
        }),
        location: fields.object(
          {
            eyebrow: text("Small Section Label"),
            ctas: fields.array(link(), { label: "Links" }),
          },
          { label: "Location" },
        ),
      },
    }),

    privateEventsIndexPage: singleton({
      label: "Private Events",
      path: "src/content/privateEventsIndexPage/private-events",
      format: "json",
      schema: {
        seo: seo(),
        hero: pageHero("private-events-index-hero"),
        stats: fields.array(
          fields.object({ value: text("Value"), label: text("Label") }),
          { label: "Stats" },
        ),
        why: fields.object(
          {
            imageSrc: imageField("private-events-index-why", {
              label: "Image",
            }),
            imageAlt: text("Image Description for Accessibility"),
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            body: textList("Body Paragraphs"),
            cta: link("Call to Action"),
          },
          { label: "Why Miss B's" },
        ),
        types: fields.object(
          {
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            learnMore: text("Learn More Label"),
            order: fields.array(
              text(
                "⚠️ Advanced — Event Page Reference",
                false,
                "Connects each card to its private-event page. Leave unchanged unless your website team asks you to edit it.",
              ),
              { label: "Display Order" },
            ),
          },
          { label: "Event Types" },
        ),
        process: fields.object(
          { eyebrow: text("Small Section Label"), heading: text("Heading") },
          { label: "Process" },
        ),
        inquiry: fields.object(
          {
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            body: text("Body", true),
            iframeSrc: text("Form URL"),
            iframeTitle: text("Form Title"),
          },
          { label: "Inquiry" },
        ),
        detail: fields.object(
          {
            heroImage: imageField("private-events-detail-hero", {
              label: "Hero Image",
            }),
            splitImage: imageField("private-events-detail-split", {
              label: "Split-Section Image",
            }),
            splitHeading: text("Split-Section Heading"),
            submitLabel: text("Submit Label"),
            submitHref: text("Submit Link Destination"),
            includedEyebrow: text("Included Section Label"),
            includedHeading: text("Included Heading"),
            includedBody: text("Included Body", true),
            bookPrefix: text("Booking Heading Prefix"),
            inquiryBody: text("Inquiry Body", true),
            allEventsLabel: text("All Events Label"),
            allEventsHref: text("All Events Link Destination"),
            viewSpaceLabel: text("View Space Label"),
            viewSpaceHref: text("View Space Link Destination"),
          },
          { label: "Event Detail Defaults" },
        ),
      },
    }),

    blogIndexPage: singleton({
      label: "Blog",
      path: "src/content/blogIndexPage/blog",
      format: "json",
      schema: {
        seo: seo(),
        hero: pageHero("blog-index-hero", false),
        readMore: text("Read More Label"),
        cta: fields.object(
          {
            eyebrow: text("Small Section Label"),
            heading: text("Heading"),
            body: text("Body"),
            links: fields.array(link(), { label: "Links" }),
          },
          { label: "Index Call to Action" },
        ),
        postCta: fields.object(
          {
            imageSrc: imageField("blog-post-cta", { label: "Image" }),
            imageAlt: text("Image Description for Accessibility"),
            heading: text("Heading"),
            body: text("Body"),
            links: fields.array(link(), { label: "Links" }),
            backLabel: text("Back Label"),
          },
          { label: "Post Call to Action" },
        ),
      },
    }),
  },

  collections: {
    menuFood: menuCollection(
      "Food Menu Items",
      "src/content/menuFood/*",
      "food",
      "menu-food-item-image",
    ),
    menuBrunch: menuCollection(
      "Brunch Menu Items",
      "src/content/menuBrunch/*",
      "brunch",
      "menu-brunch-item-image",
    ),
    menuCocktails: menuCollection(
      "Cocktail Menu Items",
      "src/content/menuCocktails/*",
      "cocktails",
      "menu-cocktail-item-image",
    ),
    menuCategoryCards: collection({
      label: "Menu Category Cards",
      path: "src/content/menuCategoryCards/*",
      format: "json",
      slugField: "label",
      columns: ["label", "slug"],
      schema: {
        slug: text(
          "⚠️ Advanced — Menu Category Reference",
          false,
          "Connects this card to its menu category. Leave unchanged unless your website team asks you to edit it.",
        ),
        label: fields.slug({
          name: { label: "Label", validation: { isRequired: true } },
        }),
        desc: text("Description", true),
        image: imageField("menu-category-card-image", { label: "Image" }),
        alt: text("Image Description for Accessibility"),
      },
    }),
    privateEventTypes: collection({
      label: "Private Event Types",
      path: "src/content/privateEventTypes/*",
      format: "json",
      slugField: "title",
      columns: ["title", "capacity"],
      schema: {
        slug: text(
          "⚠️ Advanced — Event Page Reference",
          false,
          "Connects this entry to its private-event page. Leave unchanged unless your website team asks you to edit it.",
        ),
        title: fields.slug({
          name: { label: "Title", validation: { isRequired: true } },
        }),
        metaTitle: text("Search Result Title"),
        description: text("Search Result Description", true),
        cardDesc: text("Card Description", true),
        eyebrow: text("Small Section Label"),
        capacity: text("Capacity"),
        body: textList("Body Paragraphs"),
        includes: textList("Included Features"),
      },
    }),
    privateEventsProcessSteps: collection({
      label: "Private Events Process Steps",
      path: "src/content/privateEventsProcessSteps/*",
      format: "json",
      slugField: "title",
      columns: ["step", "title"],
      schema: {
        step: text("Step Number"),
        title: fields.slug({
          name: { label: "Title", validation: { isRequired: true } },
        }),
        body: text("Body", true),
      },
    }),
    brunchFaqs: collection({
      label: "Brunch FAQs",
      path: "src/content/brunchFaqs/*",
      format: "json",
      slugField: "q",
      columns: ["q"],
      schema: {
        q: fields.slug({
          name: { label: "Question", validation: { isRequired: true } },
        }),
        a: text("Answer", true),
      },
    }),
    generalFaqs: collection({
      label: "General FAQs",
      path: "src/content/generalFaqs/*",
      format: "json",
      slugField: "q",
      columns: ["q"],
      schema: {
        q: fields.slug({
          name: { label: "Question", validation: { isRequired: true } },
        }),
        a: text("Answer", true),
      },
    }),
  },

  ui: {
    brand: { name: "Miss B's Coconut Club" },
    navigation: {
      "Site Settings": ["siteSettings", "navigation", "footer"],
      Website: [
        "home",
        "brunchPage",
        "menuPage",
        "contactPage",
        "faqPage",
        "spacePage",
        "privateEventsIndexPage",
        "blogIndexPage",
      ],
      Menu: ["menuFood", "menuBrunch", "menuCocktails", "menuCategoryCards"],
      "Private Events": ["privateEventTypes", "privateEventsProcessSteps"],
      FAQs: ["brunchFaqs", "generalFaqs"],
    },
  },
});
