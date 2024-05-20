import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config";
import User, { UserInterface } from "../models/User";

export const signUp = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: "User created successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error creating user." });
    }
};

export const signIn = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found." });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: "Invalid password." });

        const token = jwt.sign({ _id: user._id }, config.jwtSecret);
        res.header("Authorization", token).json({ token });
    } catch (error) {
        res.status(500).json({ message: "Error signing in." });
    }
};
