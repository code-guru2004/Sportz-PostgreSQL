import {prisma} from "../config/prisma.js";

/*
|--------------------------------------------------------------------------
| Complete Profile
|--------------------------------------------------------------------------
*/
export const completeProfileController = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      profilePictureUrl,
      documents,   // array of { documentType, documentUrl }
      club,
      sport,
      address,
      level,
      bio
    } = req.body;

    const userId = req.user.id;   // from auth middleware (Prisma)

    // Validate required fields
    if (!fullName || !dateOfBirth || !sport || !address || !level) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: "Profile already completed"
      });
    }

    // Use transaction to create profile and its documents atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create profile
      const profile = await tx.profile.create({
        data: {
          userId,
          fullName,
          dateOfBirth: new Date(dateOfBirth),
          profilePictureUrl: profilePictureUrl || "",
          club: club || "",
          sport,
          address,
          level,
          bio: bio || "",
          // Create documents if provided
          documents: documents?.length ? {
            create: documents.map(doc => ({
              documentType: doc.documentType,
              documentUrl: doc.documentUrl
            }))
          } : undefined
        },
        include: {
          documents: true
        }
      });

      // Update user's profileCompleted flag
      await tx.user.update({
        where: { id: userId },
        data: { profileCompleted: true }
      });

      return profile;
    });

    return res.status(201).json({
      success: true,
      message: "Profile completed successfully",
      profile: result
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get My Profile
|--------------------------------------------------------------------------
*/
export const getMyProfileController = async (req, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            role: true
          }
        },
        documents: true
      }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    // Add virtual age (computed on the fly)
    const age = profile.dateOfBirth
      ? (() => {
          const today = new Date();
          const dob = new Date(profile.dateOfBirth);
          let age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
          return age;
        })()
      : null;

    return res.status(200).json({
      success: true,
      profile: {
        ...profile,
        age
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Profile
|--------------------------------------------------------------------------
*/
export const updateProfileController = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      profilePictureUrl,
      documents,
      club,
      address,
      level,
      bio
    } = req.body;

    const userId = req.user.id;

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    // Use transaction to update profile and replace documents
    const updatedProfile = await prisma.$transaction(async (tx) => {
      // Update profile
      const profile = await tx.profile.update({
        where: { userId },
        data: {
          fullName,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          profilePictureUrl,
          club,
          address,
          level,
          bio,
          // If documents array provided, replace existing ones
          ...(documents !== undefined && {
            documents: {
              deleteMany: {},  // remove all existing documents
              create: documents.map(doc => ({
                documentType: doc.documentType,
                documentUrl: doc.documentUrl
              }))
            }
          })
        },
        include: {
          documents: true
        }
      });

      return profile;
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};