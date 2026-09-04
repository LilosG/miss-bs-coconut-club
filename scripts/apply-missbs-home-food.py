from pathlib import Path
import json

index_path = Path('src/pages/index.astro')
index = index_path.read_text()
old = "import { getEntry } from 'astro:content';"
new = "import { getEntry } from 'astro:content';\nimport { Picture } from 'astro:assets';"
if old not in index:
    raise SystemExit('Expected astro:content import not found')
index = index.replace(old, new, 1)
old = "const foodRight    = page.food?.grid ?? [];"
new = '''const homeFoodGridImages = import.meta.glob('../assets/images/keystatic/home-food-grid/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' }) as Record<string, any>;
const homeFoodFeaturedImages = import.meta.glob('../assets/images/keystatic/home-food-featured/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default' }) as Record<string, any>;
const resolveOptimizedImage = (src: string, images: Record<string, any>, directory: string) => {
  const filename = src.split('/').pop();
  const key = `../assets/images/keystatic/${directory}/${filename}`;
  const image = images[key];
  if (!image) throw new Error(`Missing optimized image asset: ${key}`);
  return image;
};
const foodRight = (page.food?.grid ?? []).map((item: { src: string; name: string; alt?: string }) => ({
  ...item,
  image: resolveOptimizedImage(item.src, homeFoodGridImages, 'home-food-grid'),
}));
const featuredFoodImage = resolveOptimizedImage(page.food.featured.src, homeFoodFeaturedImages, 'home-food-featured');'''
if old not in index:
    raise SystemExit('Expected foodRight declaration not found')
index = index.replace(old, new, 1)
old = '''          <img
            src={page.food.featured.src}
            alt={page.food.featured.alt}
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />'''
new = '''          <Picture
            src={featuredFoodImage}
            formats={['avif', 'webp']}
            widths={[480, 720, 960, 1200]}
            sizes="(min-width: 1280px) 426px, 33vw"
            quality={90}
            alt={page.food.featured.alt}
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />'''
if old not in index:
    raise SystemExit('Expected featured food image block not found')
index = index.replace(old, new, 1)
old = '''            <img
              src={item.src}
              alt={"Miss B's Coconut Club " + item.name + " Mission Beach San Diego"}
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />'''
new = '''            <Picture
              src={item.image}
              formats={['avif', 'webp']}
              widths={[320, 480, 640, 960]}
              sizes="(min-width: 1280px) 426px, 33vw"
              quality={90}
              alt={item.alt ?? ("Miss B's Coconut Club " + item.name + " Mission Beach San Diego")}
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />'''
if old not in index:
    raise SystemExit('Expected food grid image block not found')
index = index.replace(old, new, 1)
index_path.write_text(index)

home_path = Path('src/content/home/home.json')
home = json.loads(home_path.read_text())
home['food']['featured']['src'] = '../../assets/images/keystatic/home-food-featured/miss-bs-coconut-club-food-mission-beach-09.webp'
grid = home['food']['grid']
if len(grid) != 4:
    raise SystemExit(f'Expected four food grid items, got {len(grid)}')
grid[0]['src'] = '../../assets/images/keystatic/home-food-grid/miss-bs-coconut-club-food-mission-beach-13.webp'
grid[1] = {'src': '../../assets/images/keystatic/home-food-grid/miss-bs-coconut-club-mission-beach-favorites-tacos.jpg', 'name': "Miss B's Favorites Tacos", 'alt': "Miss B's Favorites tacos at Miss B's Coconut Club in Mission Beach San Diego"}
grid[2] = {'src': '../../assets/images/keystatic/home-food-grid/miss-bs-coconut-club-mission-beach-poke-bowl.jpg', 'name': 'Poke Bowl', 'alt': "Poke bowl at Miss B's Coconut Club in Mission Beach San Diego"}
grid[3] = {'src': '../../assets/images/keystatic/home-food-grid/miss-bs-coconut-club-mission-beach-caribbean-bbq-chicken-salad.jpg', 'name': 'Caribbean BBQ Chicken Salad', 'alt': "Caribbean BBQ chicken salad at Miss B's Coconut Club in Mission Beach San Diego"}
home_path.write_text(json.dumps(home, indent=2) + '\n')

key_path = Path('keystatic.config.ts')
key = key_path.read_text()
marker = '''  return fields.image(options);
}

const plainLabel'''
replacement = '''  return fields.image(options);
}

function optimizedImageField(
  namespace: string,
  { label, required = true, description }: ImageFieldOptions,
) {
  if (!namespace.trim()) throw new Error(`A non-empty image namespace is required for ${label}`);
  const options = {
    label,
    description: description ?? `${required ? "Required" : "Optional"} source image. Astro generates responsive AVIF/WebP derivatives at build time.`,
    directory: `src/assets/images/keystatic/${namespace}`,
    publicPath: `../../assets/images/keystatic/${namespace}/`,
    ...(required ? { validation: { isRequired: true as const } } : {}),
  } as Parameters<typeof fields.image>[0];
  return fields.image(options);
}

const plainLabel'''
if marker not in key:
    raise SystemExit('Expected Keystatic image helper marker not found')
key = key.replace(marker, replacement, 1)
old = '            featured: imageCard("home-food-featured", "Featured Dish"),'
new = '''            featured: fields.object(
              {
                src: optimizedImageField("home-food-featured", { label: "Image" }),
                name: text("Name"),
                alt: text("Image Description for Accessibility"),
              },
              { label: "Featured Dish" },
            ),'''
if old not in key:
    raise SystemExit('Expected featured food Keystatic field not found')
key = key.replace(old, new, 1)
old = 'src: imageField("home-food-grid", { label: "Image" }),' 
new = 'src: optimizedImageField("home-food-grid", { label: "Image" }),' 
if old not in key:
    raise SystemExit('Expected home food grid Keystatic image field not found')
key = key.replace(old, new, 1)
key_path.write_text(key)
