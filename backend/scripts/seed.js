import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tag from '../models/Tag.js';
import Question from '../models/Question.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDatabase = async () => {
  console.log('================================================================');
  console.log('       MOCKMATE DATA-DRIVEN DATABASE SEEDER (PHASE 2 PART 3)    ');
  console.log('================================================================\n');

  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in backend/.env file');
    }

    // 1. Connect to MongoDB Atlas
    console.log('[1/5] Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('  -> Connected successfully! ✅\n');

    // 2. Read JSON files
    const tagsFilePath = path.join(__dirname, '../data/tags.json');
    const questionsFilePath = path.join(__dirname, '../data/questions.json');

    console.log('[2/5] Reading data source JSON files...');
    if (!fs.existsSync(tagsFilePath)) {
      throw new Error(`Tags file missing at: ${tagsFilePath}`);
    }
    if (!fs.existsSync(questionsFilePath)) {
      throw new Error(`Questions file missing at: ${questionsFilePath}`);
    }

    const tagsRaw = fs.readFileSync(tagsFilePath, 'utf-8');
    const questionsRaw = fs.readFileSync(questionsFilePath, 'utf-8');

    const tagsData = JSON.parse(tagsRaw);
    const questionsData = JSON.parse(questionsRaw);

    console.log(`  -> Found ${tagsData.length} tag entries.`);
    console.log(`  -> Found ${questionsData.length} question entries. ✅\n`);

    // 3. Wipe existing Tag and Question collections clean
    console.log('[3/5] Wiping existing Tag and Question collections...');
    const deletedTags = await Tag.deleteMany({});
    const deletedQuestions = await Question.deleteMany({});
    console.log(`  -> Deleted ${deletedTags.deletedCount} existing tags.`);
    console.log(`  -> Deleted ${deletedQuestions.deletedCount} existing questions. ✅\n`);

    // 4. Insert Tags & Build slug -> _id mapping dictionary
    console.log('[4/5] Inserting Tags & constructing slug lookup dictionary...');
    const createdTags = await Tag.insertMany(tagsData);
    console.log(`  -> Successfully seeded ${createdTags.length} tags into database.`);

    const tagSlugToIdMap = {};
    for (const tag of createdTags) {
      tagSlugToIdMap[tag.slug] = tag._id;
    }
    console.log('  -> Tag slug-to-ID lookup dictionary constructed. ✅\n');

    // 5. Map question tag slugs to ObjectIds & Insert Questions
    console.log('[5/5] Mapping question tag slugs to ObjectIds and inserting questions...');
    const formattedQuestions = questionsData.map((q, index) => {
      const tagSlugs = Array.isArray(q.tags) ? q.tags : [];
      const mappedTagIds = [];

      for (const slug of tagSlugs) {
        const tagId = tagSlugToIdMap[slug];
        if (tagId) {
          mappedTagIds.push(tagId);
        } else {
          console.warn(`  ⚠️ Warning: Tag slug "${slug}" in question index ${index} ("${q.title}") not found in tags map.`);
        }
      }

      return {
        title: q.title,
        track: q.track,
        difficulty: q.difficulty,
        type: q.type,
        tags: mappedTagIds,
        idealAnswerFormat: q.idealAnswerFormat
      };
    });

    const createdQuestions = await Question.insertMany(formattedQuestions);
    console.log(`  -> Successfully seeded ${createdQuestions.length} questions into database. ✅\n`);

    console.log('================================================================');
    console.log('           DATABASE SEEDING COMPLETED SUCCESSFULLY! 🎉          ');
    console.log(`           Tags Seeded:      ${createdTags.length}`);
    console.log(`           Questions Seeded: ${createdQuestions.length}`);
    console.log('================================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal Database Seeding Error:', error.message);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
};

seedDatabase();
