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
  Skeleton,
  FormControlLabel,
  Checkbox
} from '@mui/material'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'

// ** Imports
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { backendApi } from 'src/configs/axios'

import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'

const UserEdit = () => {
  const [fields, setFields] = useState({
    name: '',
    username: '',
    email: '',
    role_uid: '',
    user_uid: ''
  })

  const updateData = (k, v) => setFields(prev => ({ ...prev, [k]: v }))

  const [isDisable, setIsDisable] = useState(false)
  const [parentMenu, setParentMenu] = useState([])
  const [isSkeleton, setIsSkeleton] = useState(true)
  const [company, setCompany] = useState([])
  const [companyAll, setCompanyAll] = useState([])
  const [checked, setChecked] = useState([])

  // console.log(checked)

  const router = useRouter()

  const fieldHandler = e => {
    const name = e.target.name
    const value = e.target.value

    setFields({
      ...fields,
      [name]: value
    })
  }

  async function editHandler(e) {
    e.preventDefault()
    setIsDisable(true)

    const dataForm = JSON.stringify({
      name: fields.name,
      username: fields.username,
      email: fields.email,
      role_uid: fields.role_uid,
      user_uid: fields.user_uid,
      checked: checked
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/user-edit', dataForm)
        .then(res => {
          router.push('/users')
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

  async function getData() {
    const { id } = router.query

    const dataForm = JSON.stringify({
      user_uid: id
    })

    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/user-get-by-uid', dataForm)
        .then(res => {
          updateData('name', res.data.data.name)
          updateData('username', res.data.data.username)
          updateData('email', res.data.data.email)
          updateData('role_uid', res.data.data.role_uid)
          updateData('user_uid', res.data.data.user_uid)

          const data1 = res.data.data.company_access
          const data2 = data1.map(item => item.company_uid)
          setChecked(data2)

          resolve('success')
          setIsSkeleton(false)
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })

    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/get-company')
        .then(res => {
          setCompany(res.data.data)

          const data1 = res.data.data
          const data2 = data1.map(item => item.company_uid)
          setCompanyAll(data2)

          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
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
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCheckbox = event => {
    var updatedList = [...checked]
    if (event.target.checked) {
      updatedList = [...checked, event.target.value]
    } else {
      if (checked.indexOf(event.target.value) !== -1) {
        updatedList.splice(checked.indexOf(event.target.value), 1)
      }
    }
    setChecked(updatedList)
  }

  const handleSelectClick = () => {
    setChecked(oldSelected => (oldSelected.length === 0 ? companyAll : []))
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>User Edit</Typography>} subtitle={null} />
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='User Info' />
          <CardContent>
            {isSkeleton ? (
              <Grid>
                <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
                <Skeleton variant='text' sx={{ fontSize: '3rem' }} />
              </Grid>
            ) : (
              <form onSubmit={editHandler.bind(this)}>
                <Grid container spacing={8}>
                  <Grid container item md={6} xs={12} rowSpacing={8}>
                    <Grid item xs={12}>
                      <TextField
                        value={fields.name}
                        onChange={fieldHandler}
                        size='small'
                        fullWidth
                        name='name'
                        label='Name'
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        value={fields.username}
                        onChange={fieldHandler}
                        size='small'
                        fullWidth
                        name='username'
                        label='Username'
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                  <Grid container item md={6} xs={12} rowSpacing={8}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel shrink>Role</InputLabel>
                        <Select
                          label='Role'
                          value={fields.role_uid}
                          notched
                          name='role_uid'
                          size='small'
                          onChange={fieldHandler}
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
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        value={fields.email}
                        onChange={fieldHandler}
                        size='small'
                        fullWidth
                        name='email'
                        type={'email'}
                        label='Email'
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>

                  <Grid container item>
                    <Typography variant='h6' sx={{ mb: 2.5, mr: 2.5 }}>
                      Company Access
                    </Typography>
                    <Box>
                      <Button onClick={handleSelectClick}>
                        {checked.length === 0 ? 'Select all' : 'Unselect all'}
                      </Button>
                    </Box>

                    <Grid container direction='column' justifyContent='flex-start' alignItems='flex-start'>
                      {company.map((data, index) => (
                        <FormControlLabel
                          key={index}
                          control={
                            <Checkbox
                              value={data.company_uid}
                              checked={checked.includes(data.company_uid)}
                              icon={<BookmarkBorderIcon />}
                              checkedIcon={<BookmarkIcon />}
                              onChange={handleCheckbox}
                            />
                          }
                          label={`${data.label} - ${data.id} `}
                        />
                      ))}
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
                        Edit
                        {isDisable && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

UserEdit.acl = {
  action: 'manage',
  subject: 'user-edit'
}

export default UserEdit
