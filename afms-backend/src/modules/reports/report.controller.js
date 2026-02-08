import cloudinary from '../../config/cloudinary'
import Report from './report.model'

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

  let images = []

  for (const file of req.files) {
    const result = await cloudinary.uploader
      .upload_stream(
        {
          folder: 'afms-reports'
        },
        (error, result) => {
          if (error) throw error
          return result
        }
      )
      .end(file.data)

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
}

export const getUserReport = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id }).sort('-createdAt')
    res.json(reports)
  } catch (err) {
    throw new Error(`Error fetching user reports: ${err.message}`)
  }
}

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('user', 'name email')
      .sort('-createdAt')

    res.json(reports)
  } catch (err) {
    throw new Error(`Error fetching all reports: ${err.message}`)
  }
}

export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate(
      'user',
      'name email'
    )
    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }
    res.json(report)
  } catch (err) {
    throw new Error(`Error fetching report: ${err.message}`)
  }
}

export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }
    if (report.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' })
    }
    await report.remove()
    res.json({ message: 'Report deleted' })
  } catch (err) {
    throw new Error(`Error deleting report: ${err.message}`)
  }
}

export const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }
    if (report.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' })
    }
    const { title, description, severity, state, lga } = req.body
    if (title) report.title = title
    if (description) report.description = description
    if (severity) report.severity = severity
    if (state) report.state = state
    if (lga) report.lga = lga

    await report.save()
    res.json(report)
  } catch (err) {
    throw new Error(`Error updating report: ${err.message}`)
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
