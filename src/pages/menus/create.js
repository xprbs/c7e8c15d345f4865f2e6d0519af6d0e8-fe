import React, { useEffect, useState } from 'react'

import {
  CardHeader,
  CardContent,
  InputAdornment,
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
  menus_name: yup.string().required(),
  menus_type: yup.string().required(),
  url: yup.string().required(),
  icon: yup.string().required(),
  parent_id: yup.string(),
  order_by: yup.string().required(),
  acl_action: yup.string().required(),
  acl_subject: yup.string().required()
})

const CreateMenu = () => {
  const [fields, setFields] = useState({
    menus_name: '',
    menus_type: '',
    url: '',
    icon: '',
    level: '',
    parent_id: '',
    order_by: '',
    acl_action: '',
    acl_subject: ''
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
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  async function createHandler() {
    setIsDisable(true)

    const dataForm = JSON.stringify({
      menus_name: fields.menus_name,
      menus_type: fields.menus_type,
      url: fields.url,
      icon: fields.icon,
      level: fields.level,
      parent_id: fields.parent_id,
      order_by: fields.order_by,
      acl_action: fields.acl_action,
      acl_subject: fields.acl_subject
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/menu-store', dataForm)
        .then(res => {
          router.push('/menus')
          setIsDisable(false)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
          setIsDisable(false)
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

  async function getMenuLevel1() {
    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/menu-level-1')
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
    getMenuLevel1()
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>Create Menu</Typography>} subtitle={null} />
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
                      {...register('menus_name')}
                      onChange={fieldHandler}
                      fullWidth
                      name='menus_name'
                      label='Menu'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.menus_name)}
                      helperText={errors.menus_name && errors.menus_name.message}
                    />
                  </Grid>
                  <Grid container item spacing={6}>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel shrink error={Boolean(errors.menus_type)}>
                          Menu Type
                        </InputLabel>
                        <Select
                          {...register('menus_type')}
                          label='Menu Type'
                          defaultValue=''
                          notched
                          name='menus_type'
                          size='small'
                          onChange={fieldHandler}
                          error={Boolean(errors.menus_type)}
                        >
                          <MenuItem value={'sectionTitle'}>Module</MenuItem>
                          <MenuItem value={'Pages'}>Menu</MenuItem>
                        </Select>
                        {errors.menus_type && (
                          <FormHelperText sx={{ color: 'error.main' }}>{errors.menus_type.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel shrink error={Boolean(errors.level)}>
                          Level
                        </InputLabel>
                        <Select
                          label='Level'
                          defaultValue=''
                          size='small'
                          notched
                          name='level'
                          onChange={fieldHandler}
                          error={Boolean(errors.level)}
                        >
                          <MenuItem value={1}>1</MenuItem>
                          <MenuItem value={2}>2</MenuItem>
                        </Select>
                        {errors.level && (
                          <FormHelperText sx={{ color: 'error.main' }}>{errors.level.message}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      {...register('url')}
                      onChange={fieldHandler}
                      fullWidth
                      name='url'
                      label='Url'
                      size='small'
                      placeholder={'/dashboard/sales'}
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.url)}
                      helperText={errors.url && errors.url.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      {...register('icon')}
                      onChange={fieldHandler}
                      size='small'
                      fullWidth
                      name='icon'
                      label='Icon'
                      InputLabelProps={{ shrink: true }}
                      placeholder={'material-symbols:add-link-rounded'}
                      error={Boolean(errors.icon)}
                      helperText={errors.icon && errors.icon.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position='end'>
                            <Icon
                              icon={'material-symbols:add-link-rounded'}
                              onClick={e => window.open('https://icon-sets.iconify.design/', '_blank')}
                              cursor='pointer'
                            />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid container item md={6} xs={12} rowSpacing={8}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel shrink error={Boolean(errors.parent_id)}>
                        Parent Menu
                      </InputLabel>
                      <Select
                        {...register('parent_id')}
                        label='Parent Menu'
                        defaultValue=''
                        size='small'
                        notched
                        name='parent_id'
                        onChange={fieldHandler}
                        error={Boolean(errors.parent_id)}
                      >
                        <MenuItem value=''>
                          <em>Choose</em>
                        </MenuItem>
                        {parentMenu.map((data, id) => {
                          return (
                            <MenuItem key={id} value={data.menus_uid}>
                              {data.menus_name}
                            </MenuItem>
                          )
                        })}
                      </Select>
                      {errors.parent_id && (
                        <FormHelperText sx={{ color: 'error.main' }}>{errors.parent_id.message}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      {...register('order_by')}
                      onChange={fieldHandler}
                      fullWidth
                      name='order_by'
                      label='Order By'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.order_by)}
                      helperText={errors.order_by && errors.order_by.message}
                      type={'number'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      {...register('acl_action')}
                      onChange={fieldHandler}
                      fullWidth
                      name='acl_action'
                      label='ACL Action'
                      size='small'
                      placeholder='manage'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.acl_action)}
                      helperText={errors.acl_action && errors.acl_action.message}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      {...register('acl_subject')}
                      onChange={fieldHandler}
                      fullWidth
                      name='acl_subject'
                      label='ACL Subject'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.acl_subject)}
                      helperText={errors.acl_subject && errors.acl_subject.message}
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
                    <Button component={Link} href={'/menus'} variant='outlined' size='small'>
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

CreateMenu.acl = {
  action: 'manage',
  subject: 'menus-create'
}

export default CreateMenu
