import { Hono } from '@hono/mod.ts'
import { captureException } from '@error'
import { groupController } from '@controller'
import { auth } from '@middlewares/auth.ts'
import { zJSONValidator } from '@middlewares/validators.ts'
import z from '@zod/index.ts'

// deno-lint-ignore ban-types
const idApi = new Hono<{}, {}, '/api/groups/:id'>()

idApi.get('/', auth, async (ctx) => {
    try {
        const group = await groupController.get(ctx.req.param('id'))
        return ctx.json(group)
    } catch (error) {
        if (error.message === 'Group not found') return ctx.json({ error: error.message }, 404)
        captureException(error)
    }
})

idApi.post(
    '/join',
    auth,
    async (ctx) => {
        try {
            await groupController.addMember({
                id: ctx.req.param().id,
                user_id: ctx.var.user.id,
            })
            const group = await groupController.get(ctx.req.param().id)
            return ctx.json(group)
        } catch (error) {
            if (error.message === 'Group not found') return ctx.json({ error: error.message }, 404)
            if (error.message.includes('User is already')) return ctx.json({ error: error.message }, 400)
            captureException(error)
            return ctx.json({ error: 'Internal server error' }, 500)
        }
    },
)

idApi.post(
    '/leave',
    auth,
    async (ctx) => {
        try {
            await groupController.removeMember({
                id: ctx.req.param().id,
                user_id: ctx.var.user.id,
            })
            return ctx.body(null, 204)
        } catch (error) {
            if (error.message === 'Group not found') return ctx.json({ error: error.message }, 404)
            if (error.message.includes('User is already')) return ctx.json({ error: error.message }, 400)
            captureException(error)
            return ctx.json({ error: 'Internal server error' }, 500)
        }
    },
)

idApi.get('/members', auth, async (ctx) => {
    try {
        const group = await groupController.get(ctx.req.param().id)
        const isOwner = group.owner_id === ctx.var.user.id
        const isMember = groupController.isMember(ctx.req.param().id, ctx.var.user.id)
        if (!isOwner && !isMember) return ctx.json({ error: 'Unauthorized' }, 401)
        const members = await groupController.getMembers(ctx.req.param().id)
        return ctx.json(members)
    } catch (error) {
        if (error.message === 'Group not found') return ctx.json({ error: error.message }, 404)
        captureException(error)
        return ctx.json({ error: 'Internal server error' }, 500)
    }
})

idApi.delete('/members/:user_id', auth, async (ctx) => {
    try {
        const group = await groupController.get(ctx.req.param().id)
        if (group.owner_id !== ctx.var.user.id) {
            return ctx.json({ error: 'Unauthorized' }, 401)
        }
        await groupController.removeMember({
            id: ctx.req.param().id,
            user_id: ctx.req.param().user_id,
        })
        return ctx.json({ status: 'ok' })
    } catch (error) {
        if (error.message === 'Group not found') return ctx.json({ error: error.message }, 404)
        if (error.message.includes('User is already')) return ctx.json({ error: error.message }, 400)
        captureException(error)
        return ctx.json({ error: 'Internal server error' }, 500)
    }
})

idApi.delete('/', auth, async (ctx) => {
    try {
        const group = await groupController.get(ctx.req.param().id)
        if (group.owner_id !== ctx.var.user.id) {
            return ctx.json({ error: 'Unauthorized' }, 401)
        }
        await groupController.delete(ctx.req.param().id)
        return ctx.body(null, 204)
    } catch (error) {
        if (error.message === 'Group not found') return ctx.json({ error: error.message }, 404)
        captureException(error)
        return ctx.json({ error: 'Internal server error' }, 500)
    }
})

idApi.patch(
    '/',
    auth,
    zJSONValidator(z.object({
        name: z.string().optional(),
        description: z.string().optional(),
    })),
    async (ctx) => {
        const group = await groupController.get(ctx.req.param().id)
        if (group.owner_id !== ctx.var.user.id) {
            return ctx.json({ error: 'Unauthorized' }, 401)
        }
        const n = await groupController.update({
            id: ctx.req.param().id,
            name: ctx.var.body.name,
            description: ctx.var.body.description,
        })
        return ctx.json(n)
    },
)

export default idApi
