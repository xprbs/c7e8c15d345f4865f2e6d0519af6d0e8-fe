import React, { useCallback, useEffect, useRef, useState } from 'react'

import {
  CardHeader,
  CardContent,
  InputAdornment,
  Grid,
  Card,
  TextField,
  Button,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
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
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Imports
import Icon from 'src/@core/components/icon'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { backendApi } from 'src/configs/axios'
import Webcam from 'react-webcam'
import dynamic from 'next/dynamic'

var Editor = dynamic(() => import('src/views/editor/cke-editor'), {
  ssr: false
})

const schema = yup.object().shape({
  project_name: yup.string().required('Project Name is a required field'),
  company: yup.string().required('Company is a required field'),
  finding: yup.string().required('Finding is a required field'),
  recommendation: yup.string().required('Recommendation is a required field'),
  risk: yup.string().required('Risk is a required field'),
  due_date: yup.string().required('Due Date is a required field'),
  project_date: yup.string().required('Project Date is a required field'),
  project_location: yup.string().required('Department is a required field'),
  is_she: yup.string().required('SHE is a required field')
})

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: 'user'
}

const SurveillanceForm = props => {
  const { isDisable, createHandler } = props

  const webcamRef = useRef(null)
  const [department, setDepartment] = useState([])
  const [company, setCompany] = useState([])
  const [companyId, setCompanyId] = useState(null)
  const [location, setLocation] = useState('')
  const [imgSrc, setImgSrc] = useState(null)
  const [img, setImg] = useState(null)
  const [isCamera, setIsCamera] = useState(false)
  const [finding, setFinding] = useState(false)
  const [risk, setRisk] = useState(false)
  const [recommendation, setRecommendation] = useState(false)
  const [dataImage, setDataImage] = useState([])
  const [description, setDescription] = useState('')
  const [typeCapture, setTypeCapture] = useState(null)
  const [locationId, setLocationId] = useState(null)
  const [sheId, setSHE] = useState(null)

  const [dataSHE, setDataSHE] = useState([
    { id: 0, label: 'NONE SHE' },
    { id: 1, label: 'SHE' }
  ])

  const handleOpen = () => setIsCamera(true)
  const handleClose = () => setIsCamera(false)

  const [fields, setFields] = useState({
    project_name: null,
    project_date: null,
    due_date: null
  })

  const clearImage = () => {
    setImgSrc(null)
    setLocation('')
    setImg(null)
    setTypeCapture('')
    setDescription('')
  }

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
    setValue,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  async function getInit() {
    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/get-dept')
        .then(res => {
          setDepartment(res.data.data)
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

  const addImage = () => {
    setDataImage([
      ...dataImage,
      {
        id: Math.random(),
        imgSrc,
        geo_location: location,
        image: img,
        description,
        comment01: typeCapture,
        comment02: ''
      }
    ])

    clearImage()
  }

  const removeImage = id => {
    const filterDataImage = dataImage.filter(d => d.id !== id)
    setDataImage(filterDataImage)
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot()

    const file = new File([Uint8Array.from(btoa(imageSrc), m => m.codePointAt(0))], Math.random() + '.jpeg', {
      type: 'image/jpeg'
    })
    setImgSrc(imageSrc)
    setImg(file)
    setIsCamera(false)
    getLocation()
    setTypeCapture('CAPTURE')
  }, [webcamRef, setImgSrc, setIsCamera, setImg])

  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords
        setLocation(`${latitude},${longitude}`)
      })
    } else {
      toast('Failed to get geolocation.')
    }
  }

  const preview = target => {
    setImgSrc(URL.createObjectURL(target.target.files[0]))
    setImg(target.target.files[0])
    getLocation()
    setTypeCapture('FILE')
  }

  useEffect(() => {
    getInit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const listImage = dataImage.map(d => {
    return (
      <TableRow key={d.id}>
        <TableCell>{d.description}</TableCell>
        <TableCell>{d.geo_location}</TableCell>
        <TableCell>
          <img style={{ width: '50px' }} src={d.imgSrc} alt='img' />
        </TableCell>
        <TableCell>{d.comment01}</TableCell>
        <TableCell>
          <Button onClick={() => removeImage(d.id)} color='error' size='small'>
            <Icon icon={'material-symbols:delete'} />
          </Button>
        </TableCell>
      </TableRow>
    )
  })

  return (
    <form
      onSubmit={handleSubmit(() => {
        return createHandler(
          {
            dataAreaId: companyId && companyId.id,
            project_location: locationId && locationId.id,
            project_name: fields.project_name,
            project_category: 'Surveillance',
            project_date: fields.project_date,
            due_date: fields.due_date,
            risk,
            recommendation,
            finding,
            is_she: sheId && sheId.id
          },
          dataImage
        )
      })}
    >
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
      <Grid container xs={12} spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={null} />
            <CardContent>
              <Grid container spacing={8}>
                <Grid container item md={12} xs={12} spacing={5}>
                  <Grid item md={6} xs={12}>
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
                  <Grid item md={6} xs={12}>
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
                  <Grid item md={6} xs={12}>
                    <FormControl fullWidth>
                      <Autocomplete
                        size='small'
                        options={department}
                        fullWidth
                        renderInput={params => (
                          <TextField
                            {...params}
                            {...register('project_location')}
                            label='PIC Department'
                            InputLabelProps={{ shrink: true }}
                            error={Boolean(errors.project_location)}
                          />
                        )}
                        onChange={(event, newValue) => {
                          setLocationId(newValue)
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={locationId}
                      />
                      {errors.project_location && (
                        <FormHelperText sx={{ color: 'error.main' }}>{errors.project_location.message}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <FormControl fullWidth>
                      <Autocomplete
                        size='small'
                        options={dataSHE}
                        fullWidth
                        renderInput={params => (
                          <TextField
                            {...params}
                            {...register('is_she')}
                            label='SHE'
                            InputLabelProps={{ shrink: true }}
                            error={Boolean(errors.is_she)}
                          />
                        )}
                        onChange={(event, newValue) => {
                          setSHE(newValue)
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={sheId}
                      />
                      {errors.is_she && (
                        <FormHelperText sx={{ color: 'error.main' }}>{errors.is_she.message}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextField
                      {...register('project_date')}
                      onChange={fieldHandler}
                      fullWidth
                      name='project_date'
                      label='Project Date'
                      size='small'
                      type='date'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.project_date)}
                      helperText={errors.project_date && errors.project_date.message}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextField
                      {...register('due_date')}
                      onChange={fieldHandler}
                      fullWidth
                      name='due_date'
                      label='Due Date'
                      size='small'
                      type='date'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.due_date)}
                      helperText={errors.due_date && errors.due_date.message}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <InputLabel sx={{ mb: 2 }}>
                      <Typography variant='body1'>Finding</Typography>
                    </InputLabel>
                    <FormControl fullWidth>
                      <Editor
                        {...register('finding')}
                        name={'finding'}
                        initData={''}
                        onCKChange={data => {
                          setFinding(data)
                          setValue('finding', data)
                        }}
                      />
                      {errors.finding && (
                        <FormHelperText sx={{ color: 'error.main' }}>{errors.finding.message}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <InputLabel sx={{ mb: 2 }}>
                      <Typography variant='body1'>Risk</Typography>
                    </InputLabel>
                    <FormControl fullWidth>
                      <Editor
                        {...register('risk')}
                        name={'risk'}
                        initData={''}
                        onCKChange={data => {
                          setRisk(data)
                          setValue('risk', data)
                        }}
                      />
                      {errors.risk && (
                        <FormHelperText sx={{ color: 'error.main' }}>{errors.risk.message}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <InputLabel sx={{ mb: 2 }}>
                      <Typography variant='body1'>Recommendation</Typography>
                    </InputLabel>
                    <FormControl fullWidth>
                      <Editor
                        {...register('recommendation')}
                        name={'recommendation'}
                        initData={''}
                        onCKChange={data => {
                          setRecommendation(data)
                          setValue('recommendation', data)
                        }}
                      />
                      {errors.recommendation && (
                        <FormHelperText sx={{ color: 'error.main' }}>{errors.recommendation.message}</FormHelperText>
                      )}
                    </FormControl>
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
                        onChange={e => {
                          setLocation(e.target.value)
                        }}
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
                      onChange={e => setDescription(e.target.value)}
                      fullWidth
                      name='description'
                      label='Description'
                      size='small'
                      value={description}
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
                      onClick={() => addImage()}
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
                      <TableCell>Description</TableCell>
                      <TableCell>Geo Location</TableCell>
                      <TableCell>Foto</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>{listImage}</TableBody>
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

export default SurveillanceForm
