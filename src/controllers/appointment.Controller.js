const appointmentMiddleware = require('../middleware/appointmentMiddleware');
const appointmentService = require('../services/appointmentService');

exports.create = async (req, res) => {
    try{
        const {appointment, reminders, recommendations } = req.body;
        const validate = appointmentMiddleware.createData(appointment, reminders, recommendations, res);
        try {
            if(validate == true){
                const createdAppointment = await appointmentService.createAppointment(appointment, reminders, recommendations);
                res.status(201).json({
                    message: 'Cita creada exitosamente'
                });
            }
        } catch (error) {
            res.status(400).json({
                message: 'Ocurrio un error al crear la cita',
                error: error
            });
        }
       
    }catch (err){
        res.status(500).json({
            error: serverErrors.INTERNAL_SERVER_ERROR.code,
            message: serverErrors.INTERNAL_SERVER_ERROR.message,
            details: err.message
        });
    }
}

exports.update = async (req, res) => {
    try {
            const {appointment, reminders, recommendations } = req.body;
            const validate = appointmentMiddleware.updateData(appointment, reminders, recommendations, res);
            try {
                if(validate == true){
                    const updatedAppointment = await appointmentService.updateAppointment(appointment, reminders, recommendations);
                    res.status(201).json({
                        message: 'Cita actualizada exitosamente'
                    });
                }
            } catch (error) {
                res.status(400).json({
                    message: 'Ocurrio un error al actualizar la cita',
                    error: error
                });
            }
     } catch (error) {
        res.status(500).json({
            error: serverErrors.INTERNAL_SERVER_ERROR.code,
            message: serverErrors.INTERNAL_SERVER_ERROR.message,
            details: err.message
        });
    }
};

exports.delete = async (req, res) => {     
    try {
            const {appointment} = req.body;
            const validate = appointmentMiddleware.deleteData(appointment, res);
            console.log(validate);

            try {
                if(validate == true){
                    const deleteAppointment = await appointmentService.deleteAppointment(appointment);
                    res.status(201).json({
                        message: 'Cita actualizada exitosamente'
                    });
                }
            } catch (error) {
                res.status(400).json({
                    message: 'Ocurrio un error al actualizar la cita',
                    error: error
                });
            }
     } catch (error) {
        res.status(500).json({
            error: serverErrors.INTERNAL_SERVER_ERROR.code,
            message: serverErrors.INTERNAL_SERVER_ERROR.message,
            details: err.message
        });
    }
};

exports.findAll = async (req, res) => {
    try {
        
        const appointments = await appointmentService.findAllAppointment();
        res.status(201).json({
            appointments: appointments
        });
    } catch (err) {
        res.status(500).json({
            error: "Algo salió mal, por favor intenta más tarde.",
            details: err.message
        });
    }
};

exports.today = async (req, res) => {
    try {
        
        const appointments = await appointmentService.findAppointmentsToday();
        res.status(201).json({
            appointmentsToday: appointments
        });
    } catch (err) {
        res.status(500).json({
            error: "Algo salió mal, por favor intenta más tarde.",
            details: err.message
        });
    }
};

exports.findByFilter = async (req, res) => {
    try {
        const { year, month, day, hour } = req.body;

       const appointments = await appointmentService.findAppointmentsByFilter(year, month, day, hour);
        res.status(201).json({
            appointmentsByFilter: appointments
        });
    } catch (err) {
        res.status(500).json({
            error: "Algo salió mal, por favor intenta más tarde.",
            details: err.message
        });
    }
};

exports.findByFilterAdvanced = async (req, res) => {
    try {
        const { startDate, endDate, status, professional } = req.body;

       const appointments = await appointmentService.findAppointmentsByFilterAdvanced(startDate, endDate, status, professional);
        res.status(201).json({
            appointmentsByFilter: appointments
        });
    } catch (err) {
        res.status(500).json({
            error: "Algo salió mal, por favor intenta más tarde.",
            details: err.message
        });
    }
};

exports.findById = async (req, res) => {
    try {
        const {appointment} = req.body;
        const validate = appointmentMiddleware.findIdData(appointment, res);
        if(validate == true){
            const appointments = await appointmentService.findByIdAppointment(appointment);
            res.status(201).json({
                appointments: appointments
            });
        }
        
    } catch (err) {
        res.status(500).json({
            error: "Something went wrong, please try again later.",
            details: err.message
        });
    }
};