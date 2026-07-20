import { existsSync, globSync, readFileSync } from 'node:fs';
import { createReader } from '@keystatic/core/reader';
import { createServer } from 'vite';

const server = await createServer({
  configFile: false,
  server: { middlewareMode: true, hmr: false, ws: false },
});

try {
  const keystaticConfig = (await server.ssrLoadModule('/keystatic.config.ts')).default;
  const reader = createReader(process.cwd(), keystaticConfig);

  for (const key of Object.keys(keystaticConfig.singletons)) {
    await reader.singletons[key].read();
  }

  for (const key of Object.keys(keystaticConfig.collections)) {
    for (const slug of await reader.collections[key].list()) {
      await reader.collections[key].read(slug);
    }
  }

  const imageFields = [];
  const inspectField = (field, path) => {
    if (field?.formKind === 'asset') {
      let required = true;
      try {
        field.validate(null);
        required = false;
      } catch {
        // A null value failing validation means this image is required.
      }

      const serialized = field.serialize(
        { data: new Uint8Array(), extension: 'png', filename: 'audit.png' },
        { slug: 'audit' },
      );

      imageFields.push({
        path,
        directory: field.directory,
        publicPath: serialized.value.slice(0, -'audit.png'.length),
        required,
      });
    }

    if (field?.kind === 'object') {
      for (const [key, child] of Object.entries(field.fields)) {
        inspectField(child, `${path}.${key}`);
      }
    }

    if (field?.kind === 'array') {
      inspectField(field.element, `${path}[]`);
    }
  };

  for (const [key, item] of Object.entries(keystaticConfig.singletons)) {
    for (const [field, schema] of Object.entries(item.schema)) {
      inspectField(schema, `singletons.${key}.${field}`);
    }
  }

  for (const [key, item] of Object.entries(keystaticConfig.collections)) {
    for (const [field, schema] of Object.entries(item.schema)) {
      inspectField(schema, `collections.${key}.${field}`);
    }
  }

  const duplicateValues = (key) =>
    imageFields
      .filter((field, index) => imageFields.findIndex((other) => other[key] === field[key]) !== index)
      .map((field) => `${field.path}: ${field[key]}`);

  const directoryCollisions = duplicateValues('directory');
  const publicPathCollisions = duplicateValues('publicPath');
  const optionalImages = imageFields.filter((field) => !field.required).map((field) => field.path);
  const expectedOptionalImages = [
    'collections.menuFood.image',
    'collections.menuBrunch.image',
    'collections.menuCocktails.image',
  ];

  const source = readFileSync('keystatic.config.ts', 'utf8');
  const imageConstructorCalls = source.match(/fields\.image\(/g) ?? [];
  const missingImageReferences = [];

  for (const file of globSync('src/content/**/*.{json,mdx}')) {
    const content = readFileSync(file, 'utf8');
    for (const match of content.matchAll(/["'](\/images\/[^"']+)["']/g)) {
      if (!existsSync(`public${match[1]}`)) {
        missingImageReferences.push(`${file}: ${match[1]}`);
      }
    }
  }

  const errors = [];
  if (imageConstructorCalls.length !== 1) {
    errors.push(`Expected one fields.image() call site; found ${imageConstructorCalls.length}.`);
  }
  if (directoryCollisions.length) {
    errors.push(`Image directory collisions:\n${directoryCollisions.join('\n')}`);
  }
  if (publicPathCollisions.length) {
    errors.push(`Image publicPath collisions:\n${publicPathCollisions.join('\n')}`);
  }
  if (JSON.stringify(optionalImages) !== JSON.stringify(expectedOptionalImages)) {
    errors.push(`Unexpected optional image fields: ${optionalImages.join(', ')}`);
  }
  if (missingImageReferences.length) {
    errors.push(`Missing image references:\n${missingImageReferences.join('\n')}`);
  }

  if (errors.length) {
    throw new Error(errors.join('\n\n'));
  }

  console.log(
    `Verified ${Object.keys(keystaticConfig.singletons).length} singletons, ` +
      `${Object.keys(keystaticConfig.collections).length} collections, and ` +
      `${imageFields.length} collision-free image fields.`,
  );
  console.log(`Optional image fields: ${optionalImages.join(', ')}`);
  console.log('All content image references exist on disk.');
} finally {
  await server.close();
}
