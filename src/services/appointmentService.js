const { Op } = require('sequelize');
const appointmentModel = require('../models/appointmentModel');
const reminderModel = require('../models/reminderModel');
const recommendationModel = require('../models/recommendationModel');
const moment = require('moment');

const createAppointment = async (appointmentData, reminders, recommendations) => {
    try {
        // Guardar Citas
        const createdAppointment = await appointmentModel.create({
            client_id: appointmentData.client_id,
            professional_id: appointmentData.professional_id,
            date_time: appointmentData.date_time,
            appointment_time: appointmentData.appointment_time,
            duration: appointmentData.duration,
            type: appointmentData.type,
            status: appointmentData.status,
            notes: appointmentData.notes
        });
        console.log(createdAppointment);
        
        // Guardar recordatorios
        if (reminders && reminders.length > 0) {
            await Promise.all(reminders.map(reminder => {
                return reminderModel.create({
                    appointment_id: createdAppointment.id,
                    type: reminder.type,
                    message: reminder.message,
                    time_before: reminder.time_before,
                    channel: reminder.channel
                });
            }));
        }

        // Guardar recomendaciones
        if (recommendations && recommendations.length > 0) {
            await Promise.all(recommendations.map(rec => {
                return recommendationModel.create({
                    appointment_id: createdAppointment.id,
                    message: rec
                });
            }));
        }
        
        return createdAppointment;

    } catch (error) {
        throw new Error('Error creating appointment: ' + error.message);
    }
};

const updateAppointment = async(appointmentData, reminders, recommendations) => {
    try {
        // Actualizar Citas
        const updatedAppointment = await appointmentModel.update({
            client_id: appointmentData.client_id,
            professional_id: appointmentData.professional_id,
            date_time: appointmentData.date_time,
            appointment_time: appointmentData.appointment_time,
            duration: appointmentData.duration,
            type: appointmentData.type,
            status: appointmentData.status,
            notes: appointmentData.notes
        },{ where: { id: appointmentData.id } });
        
        // Actualizar recordatorios
        if (reminders && reminders.length > 0) {
            await Promise.all(reminders.map(reminder => {
                return reminderModel.update({
                    appointment_id: updatedAppointment.id,
                    type: reminder.type,
                    message: reminder.message,
                    time_before: reminder.time_before,
                    channel: reminder.channel
                },{ where: { appointment_id: appointmentData.id } });
            }));
        }

        // Actualizar recomendaciones
        if (recommendations && recommendations.length > 0) {
            await Promise.all(recommendations.map(rec => {
                return recommendationModel.update({
                    appointment_id: updatedAppointment.id,
                    message: rec
                },{ where: { appointment_id: appointmentData.id } });
            }));
        }
        
        return { message: 'Cita eliminada exitosamente.' };

    } catch (error) {
        throw new Error('Error updating appointment: ' + error.message);
    }
};

const deleteAppointment = async (appointmentData) => {
    
    try {
        const deleteRiminder = await reminderModel.destroy({
        where: { appointment_id: appointmentData.appointmentId } });
        
        const deleteRecommendation = await recommendationModel.destroy({
        where: { appointment_id: appointmentData.appointmentId } });
        console.log(deleteRecommendation)
        const deletedAppointment = await appointmentModel.destroy({
        where: { id: appointmentData.appointmentId } });

        if (!deletedAppointment) {
            throw new Error('Cita no encontrada o no se pudo eliminar.');
        }

        return updatedAppointment;
    } catch (error) {
        throw new Error('Error updating appointment: ' + error.message);
    }
};

const findAllAppointment = async () => {
    try {
        const appointmentsList = await appointmentModel.findAll({
            include:[
                {
                    model: reminderModel,
                    as: 'reminders',
                    required: false,
                },
                {
                    model: recommendationModel,
                    as: 'recommendations',
                    required: false
                }
            ]
        });

        return appointmentsList;

    } catch (error) {
        console.error("Error occurred while get appointment:", error);
        throw new Error('Error find appointment: ' + error.message);
    }
};

const findAppointmentsToday = async () => {
    try {
        const todayStart = moment().startOf('day').toISOString();
        const todayEnd = moment().endOf('day').toISOString();

        const appointmentsList = await appointmentModel.findAll({
            include:[
                {
                    model: reminderModel,
                    as: 'reminders',
                    required: false,
                },
                {
                    model: recommendationModel,
                    as: 'recommendations',
                    required: false
                }
            ],
            where: {
                date_time: {
                    [Op.gte]: todayStart,
                    [Op.lt]: todayEnd
                }
            }
        });

        return appointmentsList;

    } catch (error) {
        console.error("Error occurred while get appointment:", error);
        throw new Error('Error find appointment: ' + error.message);
    }
};

const findAppointmentsByFilter = async (year, month, day) => {
    try {
      let whereClause = {};

        if(!year || !month || !day) {
            throw new Error('No puede contener datos vacios');
        }
      
        if (year && month && day) {

            const startDate = new Date(year, month - 1, day); //YYYY-MM-DD
            const endDate = new Date(year, month - 1, day); //YYYY-MM-DD
            
            startDate.setHours(0, 0, 0, 0);  // 00:00:00 del día
            endDate.setHours(23, 59, 59, 999);// 23:59:59 del mismo día

            const startDateISO = startDate.toISOString().split('T')[0];  // Formato YYYY-MM-DD
            const endDateISO = endDate.toISOString().split('T')[0];  // Formato YYYY-MM-DD
        
            whereClause.date_time = {
            [Op.gte]: startDateISO,
            [Op.lte]: endDateISO
            };
        }
    
      const appointmentsList = await appointmentModel.findAll({
        where: whereClause,
        include: [
          {
            model: reminderModel,
            as: 'reminders',
            required: false
          },
          {
            model: recommendationModel,
            as: 'recommendations',
            required: false
          }
        ]
      });
  
      return appointmentsList;
  
    } catch (error) {
      throw new Error(error.message);
    }
};

const findAppointmentsByFilterAdvanced = async (startDate, endDate, status, professional) => {
    try {
        let whereClause = {};

        if (!startDate || !endDate || !status ) {
            throw new Error('Campos son obligatorios.');
        }

        const formatDate = (date) => {
            const [day, month, year] = date.split('/');
            return new Date(`${year}-${month}-${day}`).toISOString().split('T')[0];
        };

        const startDateISO = formatDate(startDate);
        const endDateISO = formatDate(endDate);

        whereClause.date_time = {
            [Op.gte]: startDateISO,
            [Op.lte]: endDateISO
        };

        whereClause.status = status;
        if(professional !== ''){
            whereClause.professional_id = professional;
        }
       

        const appointmentsList = await appointmentModel.findAll({
            where: whereClause,
            include: [
              {
                model: reminderModel,
                as: 'reminders',
                required: false
              },
              {
                model: recommendationModel,
                as: 'recommendations',
                required: false
              }
            ]
        });

        return appointmentsList;

    } catch (error) {
        throw new Error(error.message);
    }
};

const findByIdAppointment = async (appointmentData) => {
    
    try {

        const appointmentsList = await appointmentModel.findAll({
            where: {
              id: appointmentData.appointmentId,
            },
            include: [
              {
                model: reminderModel,
                as: 'reminders',
                required: false,
              },
              {
                model: recommendationModel,
                as: 'recommendations',
                required: false
              }
            ]
          });
          

        return appointmentsList;
      
    } catch (error) {
        throw new Error('Error updating appointment: ' + error.message);
    }
};



module.exports = {
    createAppointment,
    updateAppointment,
    deleteAppointment,
    findAllAppointment,
    findAppointmentsToday,
    findAppointmentsByFilter,
    findAppointmentsByFilterAdvanced,
    findByIdAppointment,
};
