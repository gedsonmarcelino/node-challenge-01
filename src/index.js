const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(item => item.username === username)

  if (!user) {
    return response.status(404).json({ message: "User not found!" })
  }

  request.user = user;
  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const user = users.some(item => item.username === username)
  if (user) {
    return response.status(400).json({ error: 'Username already exits.' })
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  const { title, deadline } = request.body

  const newTodo = {
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false,
    deadline: new Date(deadline).toISOString(),
    created_at: new Date().toISOString()
  }
  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  const todo = user.todos.find(item => item.id === id)
  if (!todo) {
    return response.status(404).json({ error: "Todo not found." })
  }

  let updatedTodo = {}
  const newTodos = user.todos.map(item => {
    if (item.id === id) {
      updatedTodo = { ...item, title, deadline }
      return updatedTodo
    }
    return item
  })

  user.todos = newTodos;

  return response.json(updatedTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(item => item.id === id)
  if (!todo) {
    return response.status(404).json({ error: "Todo not found." })
  }

  let updatedTodo = {}
  const newTodos = user.todos.map(item => {
    if (item.id === id) {
      updatedTodo = { ...item, done: true }
      return updatedTodo
    }
    return item
  })

  return response.json(updatedTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(item => item.id === id)
  if (!todo) {
    return response.status(404).json({ error: "Todo not found." })
  }

  const newTodos = user.todos.filter(item => item.id !== id)

  user.todos = newTodos;

  return response.status(204).json({ message: "Todo has been deleted." })
});

module.exports = app;