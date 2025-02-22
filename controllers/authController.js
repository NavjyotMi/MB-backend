const { hashedPassword } = require("../utils/authentication");
const z = require("zod");

const schema = z.object({
  fname: z
    .string()
    .min(3, "Please enter a name which is atleast 3 characters long")
    .max(15, "please enter shorter name"),
  lname: z.string(),
  email: z.string().email("this is not valid email"),
  password: z.string().optional(),
  gender: z.enum(["male", "female"]),
  role: z.literal("user"),
});

async function signup(req, res) {
  try {
    const incoming_data = req.body;
    const { success } = schema.safeParse(incoming_data);
    console.log(success);
  } catch (error) {
    console.log(error);
  }
}

async function login(req, res) {}

async function resetPassword(req, res) {}

async function forgotPassword(req, res) {}

async function logout(req, res) {}

module.exports = { signup, login, logout, resetPassword, forgotPassword };
