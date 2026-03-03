import { generateStreamToken, upsertStreamUser } from "../config/stream.js";

export const getStreamToken = async (req, res) => {
  try {
    const { userId } = req.auth();

    // Ensure the user exists in Stream Chat before generating a token.
    // This is a safety net for new users (e.g. Google OAuth) where the
    // Inngest clerk/user.created webhook may not have completed yet.
    await upsertStreamUser({ id: userId });

    const token = generateStreamToken(userId);
    if (!token) {
      return res.status(500).json({ message: "Failed to generate Stream token" });
    }
    res.status(200).json({ token });
  } catch (error) {
    console.log("Error generating Stream token:", error);
    res.status(500).json({
      message: "Failed to generate Stream token",
    });
  }
};
