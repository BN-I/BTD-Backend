import "dotenv/config";
import mongoose from "mongoose";

const CM_TO_INCHES = 0.393701;

function convertDimension(value: any): number | null {
  if (value == null || typeof value !== "number" || isNaN(value) || value <= 0) {
    return null;
  }
  return parseFloat((value * CM_TO_INCHES).toFixed(4));
}

async function migrate() {
  const uri = process.env.MONGODB_CONNECTION;
  if (!uri) {
    console.error("MONGODB_CONNECTION not set in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const collection = mongoose.connection.collection("products");

  // Fetch all products — we validate each field individually in code
  const products = await collection.find({}).toArray();
  console.log(`Total products found: ${products.length}`);

  const ops = [];

  for (const p of products) {
    const update: Record<string, number> = {};

    const newLength = convertDimension(p.length);
    const newWidth = convertDimension(p.width);
    const newHeight = convertDimension(p.height);

    if (newLength !== null) update.length = newLength;
    if (newWidth !== null) update.width = newWidth;
    if (newHeight !== null) update.height = newHeight;

    if (Object.keys(update).length > 0) {
      ops.push({
        updateOne: {
          filter: { _id: p._id },
          update: { $set: update },
        },
      });
    }
  }

  if (ops.length === 0) {
    console.log("No products with valid dimensions found. Nothing to migrate.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Migrating ${ops.length} products...`);
  const result = await collection.bulkWrite(ops);
  console.log(`Migration complete. Updated ${result.modifiedCount} products.`);

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
