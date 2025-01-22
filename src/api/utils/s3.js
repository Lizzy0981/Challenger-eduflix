import aws from 'aws-sdk'

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

export const uploadToS3 = async (file, folder) => {
  const fileName = `${folder}/${Date.now()}-${file.originalname}`
  
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  }

  try {
    const result = await s3.upload(params).promise()
    return result.Location
  } catch (error) {
    console.error('Error uploading to S3:', error)
    throw new Error('Error uploading file to S3')
  }
}

export const deleteFromS3 = async (url) => {
  const key = url.split('/').slice(-2).join('/')
  
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key
  }

  try {
    await s3.deleteObject(params).promise()
    return true
  } catch (error) {
    console.error('Error deleting from S3:', error)
    throw new Error('Error deleting file from S3')
  }
}