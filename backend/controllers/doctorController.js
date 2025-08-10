import doctorModel from "../models/doctorModel.js";

const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body;

        // Validate input
        if (!docId) {
            return res.status(400).json({ 
                success: false, 
                message: "Doctor ID is required" 
            });
        }

        const docData = await doctorModel.findById(docId);
        
        // Check if doctor exists
        if (!docData) {
            return res.status(404).json({ 
                success: false, 
                message: "Doctor not found" 
            });
        }

        const updatedDoctor = await doctorModel.findByIdAndUpdate(
            docId, 
            { available: !docData.available },
            { new: true } // Return the updated document
        ).select('-password -email'); // Exclude sensitive fields

        res.status(200).json({ 
            success: true, 
            message: "Doctor availability changed successfully",
            doctor: updatedDoctor 
        });
    } catch (error) {
        console.error("Error in changeAvailability:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error",
            error: error.message 
        });
    }
}

const doctorList = async (req, res) => { // Added req, res parameters which were missing
    try {
        const doctors = await doctorModel.find({})
            .select(['-password', '-email']); // Exclude sensitive fields
        
        res.status(200).json({ 
            success: true, 
            doctors 
        });
    } catch (error) {
        console.error("Error in doctorList:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server Error",
            error: error.message 
        });
    }
}

export { changeAvailability, doctorList };