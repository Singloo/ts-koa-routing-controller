import { Mongo } from '@/db'
import { logger, toCamelCase } from '@/utils'
import { ObjectID } from 'mongodb'
import { decodeAddressAmap } from '@/services/geographic'
import { UserInputError } from 'apollo-server-koa'

const _queryApartmeentsNearbyCoordinates = async (
  coordinates: number[],
  distance: number,
  limit: number
) => {
  if (
    !(coordinates.length === 2 && coordinates.every(o => typeof o === 'number'))
  ) {
    throw new UserInputError('Invalid coordinates')
  }

  // if (typeof distance !== 'number') {
  //   throw new Error('Distance is madatory')
  // }

  const data = await Mongo.DAO.Apartment.find({
    take: limit,
    where: {
      $query: {
        coordinates: {
          $near: {
            $geometry: { type: 'Point', coordinates: coordinates },
            $minDistance: 0,
            $maxDistance: distance,
          },
        },
      },
      $orderby: { created_time: -1 },
    },
  })
  return data.map(toCamelCase)
}

export const queryApartmentsNearby = async (parent, args, ctx) => {
  const { id, distance = 500, limit = 50 } = args
  const apartment = await Mongo.DAO.Apartment.findOne(id)
  if (!apartment) throw new UserInputError('Not found')
  const { coordinates } = apartment
  return _queryApartmeentsNearbyCoordinates(coordinates, distance, limit)
}

export const queryApartments = async (parent, args, ctx) => {
  logger.info(parent, args, ctx)
  const data = await Mongo.DAO.Apartment.find({
    take: 10,
    where: {
      title: {
        $exists: true,
      },
    },
  })
  return data.map(toCamelCase)
}

export const queryApartmentsWithLabel = async (parent, args, ctx) => {
  const { limit = 20 } = args
  const data = await Mongo.DAO.Apartment.aggregate([
    {
      $match: {
        title: {
          $exists: true,
        },
      },
    },
    {
      $lookup: {
        from: 'labeledApartments',
        localField: 'house_id',
        foreignField: 'house_id',
        as: 'labeled',
      },
    },
    {
      $match: {
        labeled: { $ne: [] },
      },
    },
    {
      $limit: limit,
    },
  ]).toArray()
  return data.map(toCamelCase)
}
// unlabeled data
export const queryApartmentsWithoutLabel = async (parent, args, ctx) => {
  const { limit = 20 } = args
  const data = await Mongo.DAO.Apartment.aggregate([
    {
      $match: {
        title: {
          $exists: true,
        },
        missingInfo: {
          $ne: false,
        },
      },
    },
    {
      $lookup: {
        from: 'labeledApartments',
        localField: 'house_id',
        foreignField: 'house_id',
        as: 'labeled',
      },
    },
    {
      $match: {
        labeled: {
          $size: 0,
        },
      },
    },
    {
      $limit: limit,
    },
  ]).toArray()
  return data.map(toCamelCase)
}

export const queryStations = async (parent, args, ctx) => {
  const data = await Mongo.DAO.Station.aggregate([
    {
      $lookup: {
        from: 'lines',
        foreignField: 'line_id',
        localField: 'line_ids',
        as: 'lines',
      },
    },
  ]).toArray()
  return data.map(toCamelCase)
}

export const queryApartmentsNearbyStation = async (parent, args, ctx) => {
  const { stationId, distance = 500, limit = 50 } = args
  // if (!stationId) throw new UserInputError('Station id is madatory')
  console.warn(stationId, typeof stationId)
  const data = await Mongo.DAO.Station.findOne({
    where: {
      station_id: stationId,
    },
  })
  if (!data) throw new UserInputError('Not found')
  return _queryApartmeentsNearbyCoordinates(data.coordinates, distance, limit)
}

export const queryApartmentsNearbyAddress = async (parent, args, ctx) => {
  const { address, city, limit, distance } = args
  const geoInfo = await decodeAddressAmap(address, city)
  // console.warn(geoInfo)
  if (!+geoInfo.count) throw new UserInputError('Cannot decode this address')
  const coordinates = geoInfo.geocodes[0].location.split(',').map(l => +l)
  return {
    coordinates,
    apartments: await _queryApartmeentsNearbyCoordinates(
      coordinates,
      distance,
      limit
    ),
  }
}
