import React, { useCallback, useEffect, useRef, useState } from 'react'

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
  FormHelperText,
  Autocomplete,
  OutlinedInput,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Modal
} from '@mui/material'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, setValue } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Imports
import Icon from 'src/@core/components/icon'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { backendApi } from 'src/configs/axios'
import Webcam from 'react-webcam'

const schema = yup.object().shape({
  project_name: yup.string().required('Project Name is a required field'),
  company: yup.string().required('Company is a required field'),
  finding: yup.string().required('Finding is a required field'),
  recommendation: yup.string().required('Recommendation is a required field'),
  risk: yup.string().required('Risk is a required field')
})

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: 'user'
}

function SurveillanceCreate() {
  const webcamRef = useRef(null)
  const [isDisable, setIsDisable] = useState(false)
  const [company, setCompany] = useState([])
  const [companyId, setCompanyId] = useState(null)
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [imgSrc, setImgSrc] = useState(null)
  const [isCamera, setIsCamera] = useState(false)

  const handleOpen = () => setIsCamera(true)
  const handleClose = () => setIsCamera(false)

  const [fields, setFields] = useState({
    question_name: null,
    finding: null,
    recommendation: null,
    risk: null
  })

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
      question_name: fields.question_name,
      question_type: auditCategoryId.id
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/question-template/store', dataForm)
        .then(res => {
          router.push('/question-template')
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(e => setIsDisable(false))
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

  async function getInit() {
    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/get-audit-category')
        .then(res => {
          // setAuditCategory(res.data.data)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })

    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/get-company-trans')
        .then(res => {
          setCompany(res.data.data)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot()
    setImgSrc(imageSrc)
    setIsCamera(false)
    getLocation()
  }, [webcamRef, setImgSrc, setIsCamera])

  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords
        setLocation(`${latitude}, ${longitude} `)
        console.log(latitude, longitude)
      })
    } else {
      toast('Failed to get geolocation.')
    }
  }

  const preview = target => {
    console.log(target.files)
    setImgSrc(URL.createObjectURL(target.target.files[0]))
  }

  useEffect(() => {
    getInit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <form onSubmit={handleSubmit(createHandler)}>
      <Modal
        open={isCamera}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Grid container direction='row' justifyContent='center' alignItems='center'>
          <Grid item>
            <Webcam
              style={{ marginTop: 10 }}
              audio={false}
              ref={webcamRef}
              screenshotFormat='image/jpeg'
              videoConstraints={videoConstraints}
              minScreenshotWidth={180}
              minScreenshotHeight={180}
            />
            <br />
            <Button
              startIcon={<Icon icon={'bi:camera-fill'} />}
              type='button'
              variant='outlined'
              size='small'
              color='inherit'
              onClick={capture}
              sx={{ marginTop: -20 }}
            >
              Capture
            </Button>
          </Grid>
        </Grid>
      </Modal>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <PageHeader title={<Typography variant='h5'>Create Project</Typography>} subtitle={null} />
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={null} />
            <CardContent>
              <Grid container spacing={8}>
                <Grid container item md={12} xs={12} spacing={5}>
                  <Grid item md={6}>
                    <TextField
                      {...register('project_name')}
                      onChange={fieldHandler}
                      fullWidth
                      name='project_name'
                      label='Project Name'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.project_name)}
                      helperText={errors.project_name && errors.project_name.message}
                    />
                  </Grid>
                  <Grid item md={3}>
                    <FormControl fullWidth>
                      <Autocomplete
                        size='small'
                        options={company}
                        fullWidth
                        renderInput={params => (
                          <TextField
                            {...params}
                            {...register('company')}
                            label='Company'
                            InputLabelProps={{ shrink: true }}
                            error={Boolean(errors.company)}
                          />
                        )}
                        onChange={(event, newValue) => {
                          setCompanyId(newValue)
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={companyId}
                      />
                      {errors.company && (
                        <FormHelperText sx={{ color: 'error.main' }}>{errors.company.message}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item md={3}>
                    <TextField
                      {...register('finding')}
                      onChange={fieldHandler}
                      fullWidth
                      name='finding'
                      label='Finding'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.finding)}
                      helperText={errors.finding && errors.finding.message}
                    />
                  </Grid>
                  <Grid item md={6}>
                    <TextField
                      {...register('recommendation')}
                      onChange={fieldHandler}
                      fullWidth
                      name='recommendation'
                      label='Recommendation'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.recommendation)}
                      helperText={errors.recommendation && errors.recommendation.message}
                    />
                  </Grid>
                  <Grid item md={3}>
                    <TextField
                      {...register('risk')}
                      onChange={fieldHandler}
                      fullWidth
                      name='risk'
                      label='Risk'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.risk)}
                      helperText={errors.risk && errors.risk.message}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={'Location'} />
            <CardContent>
              <Grid container spacing={8}>
                <Grid item md={12} container spacing={8}>
                  <Grid item md={12}>
                    <FormControl fullWidth sx={{ m: 0 }} size='small'>
                      <InputLabel shrink htmlFor='outlined-geolocation'>
                        Geo Location
                      </InputLabel>
                      <OutlinedInput
                        {...register('location')}
                        onChange={fieldHandler}
                        value={location}
                        fullWidth
                        notched
                        readOnly
                        name='location'
                        label='Geo Location'
                        size='small'
                        error={Boolean(errors.location)}
                        endAdornment={
                          <InputAdornment position='end'>
                            <IconButton onClick={() => getLocation()}>
                              <Icon icon={'akar-icons:location'} />
                            </IconButton>
                          </InputAdornment>
                        }
                      />
                    </FormControl>
                  </Grid>
                  <Grid item md={12}>
                    <TextField
                      {...register('description')}
                      onChange={fieldHandler}
                      fullWidth
                      value={description}
                      name='description'
                      label='Description'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.description)}
                      helperText={errors.description && errors.description.message}
                    />
                  </Grid>
                  <Grid item md={12}>
                    <Button
                      component='label'
                      role={undefined}
                      variant='contained'
                      tabIndex={-1}
                      startIcon={<Icon icon={'lets-icons:upload'} />}
                      size='small'
                    >
                      Upload file
                      <input hidden type='file' accept='image/*' onChange={preview} />
                    </Button>
                    {' or '}
                    <Button
                      startIcon={<Icon icon={'bi:camera-fill'} />}
                      variant='contained'
                      color='warning'
                      size='small'
                      onClick={handleOpen}
                    >
                      Camera
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      startIcon={<Icon icon={'material-symbols:add'} />}
                      type='button'
                      variant='contained'
                      size='small'
                      disabled={isDisable}
                    >
                      Add
                    </Button>
                  </Grid>
                </Grid>
                <Grid item md={6} spacing={8}>
                  {imgSrc && <img style={{ width: '100%' }} src={imgSrc} alt='img' />}
                </Grid>
              </Grid>

              <TableContainer component={Paper} sx={{ marginTop: 5 }}>
                <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Geo Location</TableCell>
                      <TableCell>Foto</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody></TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={null} />
            <CardContent>
              <Grid container spacing={8} sx={{ paddingTop: 2 }}>
                <Grid container item md={6} xs={6} rowSpacing={8}>
                  <Button component={Link} href={'/surveillance'} variant='outlined' size='small'>
                    Back
                  </Button>
                </Grid>
                <Grid container item md={6} xs={6} rowSpacing={8} sx={{ justifyContent: 'right' }}>
                  <Button type='submit' variant='contained' size='small' disabled={isDisable}>
                    Save
                    {isDisable && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </form>
  )
}

SurveillanceCreate.acl = {
  action: 'manage',
  subject: 'surveillance-create'
}

export default SurveillanceCreate
