/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ view }) => {
  return view.render('pages/index')
})

Route.get('/login', async ({ view }) => {
  return view.render('pages/auth/login')
})

Route.post('/login', 'AuthController.login').as('login')

Route.get('/admin', async ({ view }) => {
  return view.render('pages/admin/index')
}).as('admin.index')

Route.get('/admin/device', async ({ view }) => {
  return view.render('pages/admin/device')
}).as('admin.device')

Route.get('/admin/device/create', async ({ view }) => {
  return view.render('pages/admin/create_device')
}).as('admin.device.create')
