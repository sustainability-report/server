require("dotenv").config();
const router = require("express").Router();
const { clerkClient, ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");
const fileUploader = require("../config/cloudinary.config");
const FileModel = require("../models/File.model");

router.post("/files", ClerkExpressWithAuth(), fileUploader.single("file"), async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const userProfile = await clerkClient.users.getUser(userId);

    const newFile = {
      nameOfFile: req.body.nameOfFile,
      file: req.file.path,
      ownerFile: userProfile.id,
      ownerDetails: {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.emailAddresses.length > 0 ? userProfile.emailAddresses[0].emailAddress : null,
        image: userProfile.imageUrl
      }
    }
    const pushNewFileIntoDB = await FileModel.create(newFile);
    res.json(pushNewFileIntoDB);

  } catch {
    e => {
      console.log("error upload file", e)
      res.status(500).json({
        message: "error upload file",
        error: e
      })
    }
  }
});

router.get("/files", async (req, res, next) => {
  try {
    const fetchingFiles = await FileModel.find();
    const fetchingAllFilesData = await Promise.all(
      fetchingFiles.map(async (file) => {
        // Check if ownerFile is a valid non-empty string
        if (!file.ownerFile || typeof file.ownerFile !== 'string' || file.ownerFile.trim() === '') {
          console.log('Invalid or missing ownerFile for file:', file);
          return { ...file.toObject(), ownerDetails: {} }; // Return the file without ownerDetails
        }

        console.log(file.ownerFile, "owner file")

        const userProfile = await clerkClient.users.getUser(file.ownerFile);
        return {
          ...file.toObject(), // Convert Mongoose document to plain object
          ownerDetails: {
            firstName: userProfile.firstName,
            lastName: userProfile.lastName,
            email: userProfile.emailAddresses.length > 0 ? userProfile.emailAddresses[0].emailAddress : null,
            image: userProfile.imageUrl
          }
        };
      })
    );

    res.json(fetchingAllFilesData);
  } catch (e){
    
      console.log("error fetching file", e)
      res.status(500).json({
        message: "error fetching file",
        error: e
      })
    }
})

router.get("/files/:fileId", async (req, res, next) => {
  const {fileId} = req.params;

  const fetchingOneFile = await FileModel.findById(fileId)
  res.json(fetchingOneFile)

});

router.delete("/files/:fileId", async (req, res, next) => {
  const { fileId }= req.params;

  const deleteFileId = await FileModel.findByIdAndDelete(fileId)
  res.json({message: "You have successfully deleted file id", deleteFileId})
})

module.exports = router;