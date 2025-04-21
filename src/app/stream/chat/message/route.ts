import type { NextApiRequest, NextApiResponse } from 'next'

export async function GET(request: Request) {
    return Response.json({ content: request.url })
}
export async function POST(request: Request) {
    return Response.json({ message: 'hahaa' })
}