export const sanitize = async(data) => {

    const {password, role, ...sanitizedData} = data;

    return sanitizedData;

};