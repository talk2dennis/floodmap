import { uploadToCloudinary } from '../../utils/uploadToCloudinary.js'
import cloudinary from '../../config/cloudinary.js'
import Report from './report.model.js'

export const createReport = async (req, res) => {
  const { title, description, severity, state, lga, latitude, longitude } =
    req.body

  if (!latitude || !longitude)
    return res.status(400).json({ message: 'Location is required' })
  // check title and description
  if (!title || !description)
    return res
      .status(400)
      .json({ message: 'Title and description are required' })

  // check images
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ message: 'At least one image is required' })
  try {
    let images = []

    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, 'afms-reports')
      images.push({
        url: result.secure_url,
        publicId: result.public_id
      })
    }

    const report = await Report.create({
      user: req.user.id,
      title,
      description,
      severity,
      state,
      lga,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      images
    })

    res.status(201).json({
      message: 'Flood report submitted',
      report
    })
  } catch (err) {
    res.status(500).json({ message: `Error creating report: ${err.message}` })
  }
}

export const getUserReport = async (req, res) => {
  try {
    // fetch reports with user details sorted with newest first
    const reports = await Report.find({ user: req.user.id })
      .populate('user', 'name email role')
      .sort('-createdAt')
    res.json(reports)
  } catch (err) {
    res
      .status(500)
      .json({ message: `Error fetching user reports: ${err.message}` })
  }
}

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('user', 'name email role')
      .sort('-createdAt')

    res.json(reports)
  } catch (err) {
    res
      .status(500)
      .json({ message: `Error fetching all reports: ${err.message}` })
  }
}

export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate(
      'user',
      'name email role'
    )
    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }
    res.json(report)
  } catch (err) {
    res.status(500).json({ message: `Error fetching report: ${err.message}` })
  }
}

export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }
    if (report.user.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const publicIds = (report.images || [])
      .map(image => image?.publicId)
      .filter(Boolean)

    for (const publicId of publicIds) {
      const deletion = await cloudinary.uploader.destroy(publicId)
      if (deletion.result !== 'ok' && deletion.result !== 'not found') {
        throw new Error(
          `Failed to delete image from Cloudinary (publicId: ${publicId})`
        )
      }
    }

    await report.deleteOne()
    res.json({ message: 'Report deleted' })
  } catch (err) {
    console.error('Error deleting report:', err)
    res.status(500).json({ message: `Error deleting report: ${err.message}` })
  }
}

export const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }
    if (report.user.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized' })
    }
    const { title, description, severity, state, lga, status } = req.body
    if (title) report.title = title
    if (description) report.description = description
    if (severity) report.severity = severity
    if (state) report.state = state
    if (lga) report.lga = lga
    if (status && req.user.role === 'ADMIN') report.status = status

    await report.save()
    res.json(report)
  } catch (err) {
    res.status(500).json({ message: `Error updating report: ${err.message}` })
  }
}

export const verifyReport = async (req, res) => {
  const report = await Report.findById(req.params.id)
  if (!report) return res.status(404).json({ message: 'Report not found' })

  report.status = 'VERIFIED'
  report.verifiedBy = req.user.id
  await report.save()

  res.json({ message: 'Report verified' })
}

export const rejectReport = async (req, res) => {
  const report = await Report.findById(req.params.id)
  if (!report) return res.status(404).json({ message: 'Report not found' })
  report.status = 'REJECTED'
  report.verifiedBy = req.user.id
  await report.save()
  res.json({ message: 'Report rejected' })
}
