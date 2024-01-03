import React, { useEffect, useState } from 'react'

import {
  CardHeader,
  CardContent,
  Grid,
  Card,
  TextField,
  Box,
  Button,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Imports
import Icon from 'src/@core/components/icon'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { backendApi } from 'src/configs/axios'

const schema = yup.object().shape({
  name: yup.string().required(),
  username: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().required(),
  password_confirmation: yup
    .string()
    .required()
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
  role_uid: yup.object().shape({
    value: yup.string().nonNullable()
  })
})

const UserCreate = () => {
  const [fields, setFields] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_uid: ''
  })

  const [isDisable, setIsDisable] = useState(false)
  const [parentMenu, setParentMenu] = useState([])

  const router = useRouter()

  const fieldHandler = e => {
    const name = e.target.name
    const value = e.target.value

    setFields({
      ...fields,
      [name]: value
    })
  }

  const {
    register,
    setError,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  async function createHandler() {
    setIsDisable(true)

    const dataForm = JSON.stringify({
      name: fields.name,
      username: fields.username,
      email: fields.email,
      password: fields.password,
      password_confirmation: fields.password_confirmation,
      role_uid: fields.role_uid
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/user-store', dataForm)
        .then(res => {
          router.push('/users')
          setIsDisable(false)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
          setIsDisable(false)
          const errors = error.response.data
          const responseCode = error.response.status

          if (responseCode === 400) {
            Object.entries(errors).forEach(item => {
              item[1].forEach(e => {
                setError(item[0], {
                  type: 'manual',
                  message: e
                })
              })
            })
          }
        })
    })

    toast.promise(myPromise, {
      loading: 'Loading',
      success: 'Successfully create data',
      error: error => {
        if (error.response.status === 500) return error.response.data.response

        return 'Something error'
      }
    })
  }

  async function getListRole() {
    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/list-role')
        .then(res => {
          setParentMenu(res.data.data)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })
  }

  useEffect(() => {
    getListRole()
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>User Create</Typography>} subtitle={null} />
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Create' />
          <CardContent>
            <form onSubmit={handleSubmit(createHandler)}>
              <Grid container spacing={8}>
                <Grid container item md={6} xs={12} rowSpacing={8}>
                  <Grid item xs={12}>
                    <TextField
                      {...register('name')}
                      onChange={fieldHandler}
                      fullWidth
                      name='name'
                      label='Name'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.name)}
                      helperText={errors.name && errors.name.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      {...register('username')}
                      onChange={fieldHandler}
                      fullWidth
                      name='username'
                      label='Username'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.username)}
                      helperText={errors.username && errors.username.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      {...register('email')}
                      onChange={fieldHandler}
                      fullWidth
                      name='email'
                      label='Email'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.email)}
                      helperText={errors.email && errors.email.message}
                      type={'email'}
                    />
                  </Grid>
                </Grid>
                <Grid container item md={6} xs={12} rowSpacing={8}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel shrink error={Boolean(errors.role_uid)}>
                        Role
                      </InputLabel>
                      <Select
                        label='Role'
                        defaultValue=''
                        size='small'
                        notched
                        name='role_uid'
                        onChange={fieldHandler}
                        error={Boolean(errors.role_uid)}
                      >
                        <MenuItem value=''>
                          <em>Choose</em>
                        </MenuItem>
                        {parentMenu.map((data, id) => {
                          return (
                            <MenuItem key={id} value={data.role_uid}>
                              {data.role_name}
                            </MenuItem>
                          )
                        })}
                      </Select>
                      {errors.role_uid && (
                        <FormHelperText sx={{ color: 'error.main' }}>{errors.role_uid.message}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      {...register('password')}
                      onChange={fieldHandler}
                      fullWidth
                      name='password'
                      label='Password'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.password)}
                      helperText={errors.password && errors.password.message}
                      type={'password'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      {...register('password_confirmation')}
                      onChange={fieldHandler}
                      fullWidth
                      name='password_confirmation'
                      label='Password Confirmation'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.password_confirmation)}
                      helperText={errors.password_confirmation && errors.password_confirmation.message}
                      type={'password'}
                    />
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      gap: 5,
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'left'
                    }}
                  >
                    <Button component={Link} href={'/users'} variant='outlined' size='small'>
                      Back
                    </Button>
                    <Button type='submit' variant='contained' size='small' disabled={isDisable}>
                      Save
                      {isDisable && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

UserCreate.acl = {
  action: 'manage',
  subject: 'user-create'
}

export default UserCreate
