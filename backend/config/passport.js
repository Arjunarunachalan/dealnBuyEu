import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import { encryptField } from "../utils/fieldEncryption.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const encryptedEmail = encryptField(email);

        let user = await User.findOne({ email: encryptedEmail });

        if (user) {
          // If Google email already exists
          let isModified = false;

          // Add google to authProvider if not present
          if (!user.authProvider.includes("google")) {
            user.authProvider.push("google");
            isModified = true;
          }

          // Store googleId if missing
          if (!user.googleId) {
            user.googleId = profile.id;
            isModified = true;
          }

          // Always verify them
          if (!user.isVerified) {
             user.isVerified = true;
             isModified = true;
          }

          if (isModified) {
            await user.save({ validateModifiedOnly: true });
          }

          return done(null, user);
        } else {
          // New Google User - DO NOT create yet
          return done(null, {
            isNewGoogleUser: true,
            profile: {
              name: encryptField(profile.name?.givenName || "User"),
              surname: encryptField(profile.name?.familyName || ""),
              pseudoName: encryptField(profile.name?.givenName || "User"),
              email: encryptedEmail,
              googleId: profile.id,
            }
          });
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
