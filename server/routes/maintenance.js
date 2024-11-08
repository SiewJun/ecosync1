const express = require('express');
const router = express.Router();
const { Maintenance, Project, User, ConsumerProfile } = require('../models');
const authenticateToken = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Helper function to send email notifications
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

// Get all completed projects for a company
router.get('/completed-projects', authenticateToken, async (req, res) => {
  const companyId = req.user.id;

  try {
    if (req.user.role !== 'COMPANY') {
      return res.status(403).json({ message: 'Only companies can access this endpoint.' });
    }

    const completedProjects = await Project.findAll({
      where: { 
        companyId,
        status: 'COMPLETED'
      },
      include: [
        {
          model: User,
          as: 'consumer',
          attributes: ['id', 'email', 'username', 'avatarUrl'],
          include: [{
            model: ConsumerProfile,
            attributes: ['phoneNumber', 'address']
          }]
        },
        {
          model: Maintenance,
          as: 'maintenance',
          attributes: ['id', 'scheduledDate', 'status', 'notes', 'createdAt']
        }
      ]
    });

    res.status(200).json({ projects: completedProjects });
  } catch (error) {
    console.error('Error fetching completed projects:', error);
    res.status(500).json({ message: 'Failed to fetch completed projects.' });
  }
});

// Get all maintenance schedules for a company
router.get('/schedules', authenticateToken, async (req, res) => {
  const companyId = req.user.id;

  try {
    if (req.user.role !== 'COMPANY') {
      return res.status(403).json({ message: 'Only companies can access this endpoint.' });
    }

    const maintenanceSchedules = await Maintenance.findAll({
      where: { companyId },
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'status'],
          include: [{
            model: User,
            as: 'consumer',
            attributes: ['id', 'email', 'username', 'avatarUrl'],
            include: [{
              model: ConsumerProfile,
              attributes: ['phoneNumber', 'address']
            }]
          }]
        }
      ],
      order: [['scheduledDate', 'DESC']]
    });

    res.status(200).json({ schedules: maintenanceSchedules });
  } catch (error) {
    console.error('Error fetching maintenance schedules:', error);
    res.status(500).json({ message: 'Failed to fetch maintenance schedules.' });
  }
});

// Schedule maintenance for a project
router.post('/:projectId/schedule', authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  const { scheduledDate, notes } = req.body;

  try {
    const project = await Project.findByPk(projectId);

    if (!project || project.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Project must be completed to schedule maintenance.' });
    }

    if (project.companyId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to schedule maintenance for this project.' });
    }

    const maintenance = await Maintenance.create({
      projectId,
      companyId: req.user.id,
      consumerId: project.consumerId,
      scheduledDate,
      notes,
      status: 'SCHEDULED'
    });

    const consumer = await User.findByPk(project.consumerId);
    const company = await User.findByPk(req.user.id);

    const emailHtml = `
      <h2>Maintenance Appointment Scheduled</h2>
      <p>Dear ${consumer.username},</p>
      <p>A maintenance appointment has been scheduled for your solar system by ${company.username}.</p>
      <p><strong>Date:</strong> ${new Date(scheduledDate).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${new Date(scheduledDate).toLocaleTimeString()}</p>
      ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
      <p>If you need to reschedule, please log in to your account or contact us.</p>
    `;

    await sendEmail(consumer.email, 'Solar System Maintenance Scheduled', emailHtml);

    res.status(201).json({ message: 'Maintenance scheduled and notification sent.', maintenance });
  } catch (error) {
    console.error('Error scheduling maintenance:', error);
    res.status(500).json({ message: 'Failed to schedule maintenance.' });
  }
});

// Get all maintenance records for a specific project
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  const { projectId } = req.params;

  try {
    const maintenanceRecords = await Maintenance.findAll({
      where: { projectId },
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'status'],
          include: [
            {
              model: User,
              as: 'consumer',
              attributes: ['id', 'email', 'username', 'avatarUrl'],
              include: [
                {
                  model: ConsumerProfile,
                  attributes: ['phoneNumber', 'address']
                }
              ]
            }
          ]
        }
      ],
      order: [['scheduledDate', 'DESC']]
    });

    res.status(200).json({ maintenanceRecords });
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({ message: 'Failed to fetch maintenance records.' });
  }
});

// Confirm maintenance status by company
router.put('/:maintenanceId/company-confirm', authenticateToken, async (req, res) => {
  const { maintenanceId } = req.params;

  try {
    const maintenance = await Maintenance.findByPk(maintenanceId);

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found.' });
    }

    if (maintenance.companyId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to confirm this maintenance record.' });
    }

    maintenance.status = 'CONFIRMED';
    await maintenance.save();

    const consumer = await User.findByPk(maintenance.consumerId);
    const company = await User.findByPk(req.user.id);

    const emailHtml = `
      <h2>Maintenance Schedule Confirmed</h2>
      <p>Dear ${consumer.username},</p>
      <p>The maintenance appointment has been confirmed by ${company.username}.</p>
      <p><strong>Date:</strong> ${new Date(maintenance.scheduledDate).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${new Date(maintenance.scheduledDate).toLocaleTimeString()}</p>
    `;

    await sendEmail(consumer.email, 'Maintenance Schedule Confirmed', emailHtml);

    res.status(200).json({ message: 'Maintenance schedule confirmed and notification sent.', maintenance });
  } catch (error) {
    console.error('Error confirming maintenance schedule:', error);
    res.status(500).json({ message: 'Failed to confirm maintenance schedule.' });
  }
});

// Reject maintenance status by company
router.put('/:maintenanceId/company-reject', authenticateToken, async (req, res) => {
  const { maintenanceId } = req.params;
  const { reason } = req.body;

  try {
    const maintenance = await Maintenance.findByPk(maintenanceId);

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found.' });
    }

    if (maintenance.companyId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to reject this maintenance record.' });
    }

    maintenance.status = 'REJECTED';
    maintenance.notes = reason ? `Rejected: ${reason}` : maintenance.notes;
    await maintenance.save();

    const consumer = await User.findByPk(maintenance.consumerId);
    const company = await User.findByPk(req.user.id);

    const emailHtml = `
      <h2>Maintenance Schedule Rejected</h2>
      <p>Dear ${consumer.username},</p>
      <p>The maintenance appointment has been rejected by ${company.username}.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    `;

    await sendEmail(consumer.email, 'Maintenance Schedule Rejected', emailHtml);

    res.status(200).json({ message: 'Maintenance schedule rejected and notification sent.', maintenance });
  } catch (error) {
    console.error('Error rejecting maintenance schedule:', error);
    res.status(500).json({ message: 'Failed to reject maintenance schedule.' });
  }
});

// Mark maintenance as completed by company
router.put('/:maintenanceId/complete', authenticateToken, async (req, res) => {
  const { maintenanceId } = req.params;

  try {
    const maintenance = await Maintenance.findByPk(maintenanceId);

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found.' });
    }

    if (maintenance.companyId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to complete this maintenance record.' });
    }

    maintenance.status = 'COMPLETED';
    await maintenance.save();

    const consumer = await User.findByPk(maintenance.consumerId);
    const company = await User.findByPk(req.user.id);

    const emailHtml = `
      <h2>Maintenance Completed</h2>
      <p>Dear ${consumer.username},</p>
      <p>The maintenance appointment has been completed by ${company.username}.</p>
      <p><strong>Date:</strong> ${new Date(maintenance.scheduledDate).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${new Date(maintenance.scheduledDate).toLocaleTimeString()}</p>
    `;

    await sendEmail(consumer.email, 'Maintenance Completed', emailHtml);

    res.status(200).json({ message: 'Maintenance marked as completed and notification sent.', maintenance });
  } catch (error) {
    console.error('Error marking maintenance as completed:', error);
    res.status(500).json({ message: 'Failed to mark maintenance as completed.' });
  }
});

// Get all completed projects for a consumer
router.get('/consumer/completed-projects', authenticateToken, async (req, res) => {
  const consumerId = req.user.id;

  try {
    if (req.user.role !== 'CONSUMER') {
      return res.status(403).json({ message: 'Only consumers can access this endpoint.' });
    }

    const completedProjects = await Project.findAll({
      where: { 
        consumerId,
        status: 'COMPLETED'
      },
      include: [
        {
          model: User,
          as: 'company',
          attributes: ['id', 'email', 'username', 'avatarUrl'],
          include: [{
            model: ConsumerProfile,
            attributes: ['phoneNumber', 'address']
          }]
        },
        {
          model: Maintenance,
          as: 'maintenance',
          attributes: ['id', 'scheduledDate', 'status', 'notes', 'createdAt']
        }
      ]
    });

    res.status(200).json({ projects: completedProjects });
  } catch (error) {
    console.error('Error fetching completed projects:', error);
    res.status(500).json({ message: 'Failed to fetch completed projects.' });
  }
});

// Confirm proposed scheduled maintenance
router.put('/:maintenanceId/confirm', authenticateToken, async (req, res) => {
  const { maintenanceId } = req.params;

  try {
    const maintenance = await Maintenance.findByPk(maintenanceId);

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found.' });
    }

    if (maintenance.consumerId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to confirm this maintenance record.' });
    }

    maintenance.status = 'CONFIRMED';
    await maintenance.save();

    const company = await User.findByPk(maintenance.companyId);
    const consumer = await User.findByPk(req.user.id);

    const emailHtml = `
      <h2>Maintenance Schedule Confirmed</h2>
      <p>Dear ${company.username},</p>
      <p>The maintenance appointment has been confirmed by ${consumer.username}.</p>
      <p><strong>Date:</strong> ${new Date(maintenance.scheduledDate).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${new Date(maintenance.scheduledDate).toLocaleTimeString()}</p>
    `;

    await sendEmail(company.email, 'Maintenance Schedule Confirmed', emailHtml);

    res.status(200).json({ message: 'Maintenance schedule confirmed and notification sent.', maintenance });
  } catch (error) {
    console.error('Error confirming maintenance schedule:', error);
    res.status(500).json({ message: 'Failed to confirm maintenance schedule.' });
  }
});

// Reschedule maintenance by consumer
router.put('/:maintenanceId/consumer-reschedule', authenticateToken, async (req, res) => {
  const { maintenanceId } = req.params;
  const { proposedDates, reason } = req.body;

  try {
    const maintenance = await Maintenance.findByPk(maintenanceId, {
      include: [
        {
          model: Project,
          as: 'project',
          include: [{
            model: User,
            as: 'company'
          }]
        }
      ]
    });

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found.' });
    }

    if (maintenance.consumerId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to reschedule this maintenance.' });
    }

    maintenance.scheduledDate = proposedDates;
    maintenance.status = 'RESCHEDULE_PENDING';
    maintenance.notes = reason ? `Rescheduled: ${reason}` : maintenance.notes;
    await maintenance.save();

    const notifyUser = await User.findByPk(maintenance.companyId);

    const emailHtml = `
      <h2>Maintenance Appointment Rescheduled</h2>
      <p>Dear ${notifyUser.username},</p>
      <p>The maintenance appointment for project ID ${maintenance.projectId} has been proposed to be rescheduled to the following dates:</p>
      <ul>
        ${proposedDates.map(date => `<li>${new Date(date).toLocaleString()}</li>`).join('')}
      </ul>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>Please log in to your account to approve or propose new dates.</p>
    `;

    await sendEmail(notifyUser.email, 'Maintenance Appointment Rescheduled', emailHtml);

    res.status(200).json({ message: 'Maintenance reschedule proposed and notification sent.', maintenance });
  } catch (error) {
    console.error('Error proposing reschedule:', error);
    res.status(500).json({ message: 'Failed to propose reschedule.' });
  }
});

// Get all maintenance schedules for a specific project for a consumer
router.get('/consumer/project/:projectId/schedules', authenticateToken, async (req, res) => {
  const { projectId } = req.params;
  const consumerId = req.user.id;

  try {
    if (req.user.role !== 'CONSUMER') {
      return res.status(403).json({ message: 'Only consumers can access this endpoint.' });
    }

    const project = await Project.findOne({
      where: { id: projectId, consumerId },
      include: [
        {
          model: User,
          as: 'company',
          attributes: ['id', 'email', 'username', 'avatarUrl'],
          include: [{
            model: ConsumerProfile,
            attributes: ['phoneNumber', 'address']
          }]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const maintenanceSchedules = await Maintenance.findAll({
      where: { projectId },
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'status'],
          include: [
            {
              model: User,
              as: 'company',
              attributes: ['id', 'email', 'username', 'avatarUrl'],
              include: [{
                model: ConsumerProfile,
                attributes: ['phoneNumber', 'address']
              }]
            }
          ]
        }
      ],
      order: [['scheduledDate', 'DESC']]
    });

    res.status(200).json({ schedules: maintenanceSchedules });
  } catch (error) {
    console.error('Error fetching maintenance schedules:', error);
    res.status(500).json({ message: 'Failed to fetch maintenance schedules.' });
  }
});

module.exports = router;