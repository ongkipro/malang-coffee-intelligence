import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import {
  CoffeeBrandSchema,
  OsmPoiSchema,
  UniversityAnchorSchema,
} from './lib/types/coffee-intelligence';

const brands = defineCollection({
  loader: file('src/data/malang_coffee_master_93_brands.json'),
  schema: CoffeeBrandSchema,
});

const osmPois = defineCollection({
  loader: file('src/data/malang_osm_157_named_pois.json'),
  schema: OsmPoiSchema,
});

const campuses = defineCollection({
  loader: file('src/data/malang_universities_9_anchors.json'),
  schema: UniversityAnchorSchema,
});

export const collections = {
  brands,
  osmPois,
  campuses,
};
