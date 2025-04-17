import AWS from "aws-sdk";

export const s3Bucket = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadImages = async (file: any, bucketName: string) => {
  const uploadPromises = (file as Express.Multer.File[]).map(async (file) => {
    const fileName = `${Date.now()}-${file.originalname}`;

    const uploadParams = {
      Bucket: bucketName,
      Key: fileName, // You can modify this to use custom file names
      Body: file.buffer, // File content
      ContentType: file.mimetype, // Mime type of the file (e.g., image/jpeg)
      ACL: "public-read", // Make file publicly accessible (can be adjusted)
    };

    try {
      const s3Response = await s3Bucket.upload(uploadParams).promise();
      return s3Response.Location; // Return the file URL after upload
    } catch (err) {
      console.error("Error uploading to S3:", err);
      throw new Error("Error uploading file to S3");
    }
  });

  try {
    const fileUrls = await Promise.all(uploadPromises);
    return fileUrls;
  } catch (err) {
    console.error("Error uploading to S3:", err);
    throw new Error("Error uploading file to S3");
  }
};

export const uploadImage = async (file: any, bucketName: string) => {
  const fileName = `${Date.now()}-${file.originalname}`;

  const uploadParams = {
    Bucket: bucketName,
    Key: fileName, // You can modify this to use custom file names
    Body: file.buffer, // File content
    ContentType: file.mimetype, // Mime type of the file (e.g., image/jpeg)
    ACL: "public-read", // Make file publicly accessible (can be adjusted)
  };

  try {
    const s3Response = await s3Bucket.upload(uploadParams).promise();
    return s3Response.Location; // Return the file URL after upload
  } catch (err) {
    console.error("Error uploading to S3:", err);
    throw new Error("Error uploading file to S3");
  }
};
