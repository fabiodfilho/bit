import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { Login } from '../pages/Login'
import api from '../services/api'

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
    defaults: { headers: { common: {} } },
  },
}))

const renderLogin = () => render(
  <MemoryRouter>
    <AuthProvider>
      <Login />
    </AuthProvider>
  </MemoryRouter>,
)

describe('Login', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('submits credentials and stores the authenticated user', async () => {
    api.post.mockResolvedValue({
      data: {
        access_token: 'token-de-teste',
        usuario: { usuario: 'admin' },
      },
    })

    renderLogin()
    fireEvent.change(screen.getByPlaceholderText('Ex: admin ou dev.junior'), {
      target: { value: 'admin' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: '123456' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar no Sistema' }))

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/auth/login', {
      usuario: 'admin',
      senha: '123456',
    }))
    expect(localStorage.getItem('token')).toBe('token-de-teste')
    expect(JSON.parse(localStorage.getItem('usuario'))).toEqual({ usuario: 'admin' })
  })

  it('shows the API error when credentials are rejected', async () => {
    api.post.mockRejectedValue({
      response: { data: { detail: 'Credenciais inválidas' } },
    })

    renderLogin()
    fireEvent.change(screen.getByPlaceholderText('Ex: admin ou dev.junior'), {
      target: { value: 'admin' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'senha-incorreta' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar no Sistema' }))

    expect(await screen.findByText('Credenciais inválidas')).toBeTruthy()
  })
})