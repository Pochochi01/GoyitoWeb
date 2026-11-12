const AddressRepository = require('../repositories/AddressRepository')

const MAX_ADDRESSES = 3

async function list(req, res, next) {
  try { res.json(await AddressRepository.findByUser(req.user.id)) }
  catch (err) { next(err) }
}

async function create(req, res, next) {
  try {
    const count = await AddressRepository.countByUser(req.user.id)
    if (count >= MAX_ADDRESSES) {
      return res.status(400).json({ message: `Máximo ${MAX_ADDRESSES} direcciones por cuenta` })
    }

    const { alias = 'Casa', calle, numero, piso, ciudad, provincia, codigo_postal, es_principal = false } = req.body
    if (!calle || !ciudad) return res.status(400).json({ message: 'calle y ciudad son requeridos' })

    const newId = await AddressRepository.create(req.user.id, {
      alias, calle, numero, piso, ciudad, provincia, codigo_postal, es_principal,
    })
    res.status(201).json({ id: newId, message: 'Dirección agregada' })
  } catch (err) { next(err) }
}

async function update(req, res, next) {
  try {
    const id = +req.params.id
    const addr = await AddressRepository.findByIdForUser(id, req.user.id)
    if (!addr) return res.status(404).json({ message: 'Dirección no encontrada' })

    await AddressRepository.update(id, req.user.id, req.body)
    res.json({ message: 'Dirección actualizada' })
  } catch (err) { next(err) }
}

async function remove(req, res, next) {
  try {
    const rows = await AddressRepository.delete(+req.params.id, req.user.id)
    if (!rows) return res.status(404).json({ message: 'Dirección no encontrada' })
    res.json({ message: 'Dirección eliminada' })
  } catch (err) { next(err) }
}

async function setPrincipal(req, res, next) {
  try {
    const id   = +req.params.id
    const addr = await AddressRepository.findByIdForUser(id, req.user.id)
    if (!addr) return res.status(404).json({ message: 'Dirección no encontrada' })
    await AddressRepository.setPrincipal(id, req.user.id)
    res.json({ message: 'Dirección principal actualizada' })
  } catch (err) { next(err) }
}

module.exports = { list, create, update, remove, setPrincipal }
