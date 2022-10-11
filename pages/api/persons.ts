import type { NextApiRequest, NextApiResponse } from 'next'
import faker from '@faker-js/faker'
import type { Person } from '../../src/data/fetchData'
import { range } from '../../src/utils'

export type Response = {
    rows: Person[]
    pageCount: number
}

type Query = {
    page: string
    perPage: string
}

const newPerson = (): Person => {
    return {
        id: faker.datatype.uuid(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        age: faker.datatype.number(40),
        visits: faker.datatype.number(1000),
        progress: faker.datatype.number(100),
        status: faker.helpers.shuffle<Person['status']>(['In Relationship', 'Single', 'Complicated'])[0]!,
    }
}

export function makeData(...lens: number[]) {
    const makeDataLevel = (depth = 0): Person[] => {
        const len = lens[depth]!
        return range(len).map((d): Person => newPerson())
    }

    return makeDataLevel()
}

const data = makeData(10000)

function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
    const { page, perPage } = <Query>req.query
    const pageIndex = Number(page)
    const pageSize = Number(perPage)

    res.status(200).json({
        rows: data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
        pageCount: Math.ceil(data.length / pageSize),
    })
}

export default handler