import { imgsController } from '@controller'

const form = new FormData()
const avatar = await Deno.readFile('./src/public/test.png')
const file = new File([avatar], 'test.png', { type: 'image/png' })
form.append('avatar', file, 'avatar.png')
// form.set('avatar', 'avatar.png')

const r = await fetch('http://localhost:8000/api/users/@me/avatar', {
    method: 'POST',
    body: form,
    headers: {
        Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFueWFAZm9yZ2VyLmNvbSIsImlkIjoyLCJjcmVhdGVkX2F0IjoiMjAyMy0xMi0zMFQwNzoyODoyMC4yNDQxMzgrMDA6MDAiLCJ1c2VyIjp7ImlkIjoxLCJ1c2VybmFtZSI6IkFuZXdVc2VybmFtZSIsImRpc3BsYXluYW1lIjoiQW5ld0Rpc3BsYXluYW1lIiwiYXZhdGFyIjpudWxsfSwidHlwZSI6IkJlYXJlciIsImV4cGlyZXMiOjE3MDQyMTU4NzY4Njh9.i4gllZSYjZTCBOKfC8YmltOjlAezgbgkdJTV5RF8-O4',
    },
})
console.log(r)
console.log(await r.text())

// const u = await imgsController.getAvatar('1-1704131870394.png')
// console.log(u)
