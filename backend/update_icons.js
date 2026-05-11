import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Category from './modules/category/Category.model.js';

dotenv.config();

async function updateIcons() {
  try {
    await connectDB();
    
    // Home Appliances
    await Category.updateOne(
      { name: { $regex: /Home Appliances/i } },
      { $set: { icon: 'WashingMachine' } }
    );
    // Services
    await Category.updateOne(
      { name: { $regex: /Services/i } },
      { $set: { icon: 'HeartHandshake' } }
    );
    // Others
    await Category.updateOne(
      { name: { $regex: /Others/i } },
      { $set: { icon: 'MoreHorizontal' } }
    );

    console.log("Icons updated successfully.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

updateIcons();
