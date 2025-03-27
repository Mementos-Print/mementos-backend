import randomstring from "randomstring";

export const generateOtp = randomstring.generate({
    length: 6,
    charset: 'numeric'
});