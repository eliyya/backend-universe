import { imgsController } from '@controller'

const form = new FormData()
const avatar = await Deno.readFile('./src/public/test2.png')
const file = new File([avatar], 'test2.png', { type: 'image/png' })
form.append('avatar', file, 'avatar.png')
// form.set('avatar', 'avatar.png')

const r = await fetch('http://localhost:8000/api/users/@me/avatar', {
    method: 'POST',
    body: form,
    headers: {
        Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imthbm5hQGtvYmF5YXNoaS5jb20iLCJpZCI6MywiY3JlYXRlZF9hdCI6IjIwMjQtMDEtMDFUMjA6MzY6MTMuMDUzMDMzKzAwOjAwIiwidXNlciI6eyJpZCI6MiwidXNlcm5hbWUiOiJLYW5uYSIsImF2YXRhciI6bnVsbCwiZGlzcGxheW5hbWUiOm51bGx9LCJ0eXBlIjoiQmVhcmVyIiwiZXhwaXJlcyI6MTcwNDIyNzg5NDAyNX0.DvpeJl_b_s26FwjUpS6TyqUODmyff9oIzplPu8XS3ss',
    },
})
console.log(r)
console.log(await r.text())

// const u = await imgsController.getAvatar('1-1704131870394.png')
// console.log(u)
