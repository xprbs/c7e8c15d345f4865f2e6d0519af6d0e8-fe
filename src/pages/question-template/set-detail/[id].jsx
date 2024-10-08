/* eslint-disable react-hooks/rules-of-hooks */
// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import { DataGrid } from '@mui/x-data-grid'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TableBody,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  CircularProgress,
  CardHeader,
  CardContent,
  Menu,
  MenuItem,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  DialogContentText,
  DialogActions,
  Autocomplete,
  FormHelperText,
  Paper
} from '@mui/material'

import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import Divider from '@mui/material/Divider'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import Link from 'next/link'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, setValue } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import { useAuth } from 'src/hooks/useAuth'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { backendApi } from 'src/configs/axios'
import dynamic from 'next/dynamic'

var Editor = dynamic(() => import('src/views/editor/cke-editor'), {
  ssr: false
})

const schema = yup.object().shape({
  question_answer_description: yup.string().required('Description is a required field'),
  control_point: yup.string().required('Control Point is a required field'),
  question_answer_uid: yup.string().required('Answer Master is a required field'),
  klausul: yup.string().required('Ref / Klausul is a required field'),
  category: yup.string().required('Category is a required field'),
  subcategory: yup.string().required('Sub Category is a required field')
})

const detailQuestion = () => {
  const router = useRouter()
  const { id } = router.query

  const [skeleton, setSkeleton] = useState(true)
  const [skeleton2, setSkeleton2] = useState(true)
  const [isDisable, setIsDisable] = useState(false)
  const [masterQuestion, setMasterQuestion] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [masterAnswer, setMasterAnswer] = useState([])
  const [masterAnswerId, setMasterAnswerId] = useState(null)
  const [masterAnswer_Id, setMasterAnswer_Id] = useState(null)
  const [description, setDescription] = useState('')
  const [controlPoint, setControlPoint] = useState('')
  const [questionDetail, setQuestionDetail] = useState([])
  const [questionEditDetail, setQuestionEditDetail] = useState([])
  const [reload, setReload] = useState(false)
  const [openDialogAdd, setOpenDialogAdd] = useState(false)
  const [dataDelete, setDataDelete] = useState({})
  const [isLoadingDelete, setIsLoadingDelete] = useState(false)
  const [rowid, setrowiddetail] = useState([])

  console.log('questionEditDetail', questionEditDetail)

  const handleClickOpenModal = () => setOpenModal(true)
  const handleCloseModal = () => setOpenModal(false)

  const handleClickOpenEditModal = data => {
    setOpenEditModal(true)
    setrowiddetail(data.question_detail_uid)
  }
  const handleCloseEditModal = () => setOpenEditModal(false)

  const [fields, setFields] = useState({
    klausul: '',
    category: '',
    subcategory: ''
  })

  const handleDialogToggleDelete = data => {
    setDataDelete(data)
    setIsLoadingDelete(false)
    setOpenDialogAdd(!openDialogAdd)
  }

  const handleDialogToggleDeleteClose = () => {
    setIsLoadingDelete(false)
    setOpenDialogAdd(!openDialogAdd)
  }

  const fieldHandler = e => {
    const name = e.target.name
    const value = e.target.value

    // console.log(name, value)
    setFields({
      ...fields,
      [name]: value
    })
  }

  useEffect(() => {
    if (rowid && rowid !== 0) {
      new Promise((resolve, reject) => {
        backendApi
          .post(
            '/web/master/question-template/question-edit-detail-list',
            JSON.stringify({
              question_detail_uid: rowid
            }),
            {
              headers: {
                'Content-Type': 'application/json'
              }
            }
          )
          .then(res => {
            console.log('Response Data:', res.data)
            setQuestionEditDetail(res.data.data)
            resolve('success')
          })
          .catch(error => {
            console.log('Error Response:', error.response)
            reject(error)
          })
          .finally(() => setSkeleton2(false))
      })
    } else {
      setSkeleton2(false)
    }
  }, [rowid])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  const getData = async () => {
    setSkeleton(true)
    setSkeleton2(true)

    const dataForm = JSON.stringify({
      id: id
    })

    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/question-template/get-detail', dataForm)
        .then(res => {
          resolve('success')
          setMasterQuestion(res.data.data)
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(() => {
          setSkeleton(false)
        })
    })

    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/question-template/get-master-answer')
        .then(res => {
          setMasterAnswer(res.data.data)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })

    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/question-template/get-master-answer-id', { id: questionEditDetail.question_answer_uid })
        .then(res => {
          setMasterAnswer_Id(res.data.data)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })
  }

  const deleteHandler = e => {
    e.preventDefault()
    setIsLoadingDelete(true)

    const dataForm = JSON.stringify({
      row_id: dataDelete.question_detail_uid
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/question-template/question-detail-delete', dataForm)
        .then(res => {
          resolve('success')
          handleDialogToggleDeleteClose()
          updateData('reload', !data.reload)
        })
        .catch(error => {
          reject(error)
          handleDialogToggleDeleteClose()
        })
    })

    toast.promise(myPromise, {
      loading: 'Loading',
      success: 'Successfully delete data',
      error: error => {
        if (error.response.status === 500) return error.response.data.response

        return 'Something error'
      }
    })
  }

  async function createHandler() {
    setIsDisable(true)

    const dataForm = JSON.stringify({
      question_uid: masterQuestion.question_uid,
      question_answer_description: description,
      control_point: controlPoint,
      question_answer_uid: masterAnswerId.id,
      klausul: fields.klausul,
      question_category1: fields.category,
      question_category2: fields.subcategory
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/question-template/question-detail-store', dataForm)
        .then(res => {
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(e => {
          setDescription('')
          setControlPoint('')
          setMasterAnswerId(null)
          setSkeleton2(true)
          setIsDisable(false)
          setOpenModal(false)
          setReload(!reload)
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

  async function editHandler() {
    setIsDisable(true)

    const dataForm = JSON.stringify({
      question_answer_description: description,
      control_point: controlPoint,
      klausul: fields.klausul,
      question_category1: fields.category,
      question_category2: fields.subcategory,
      row_id: rowid
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/question-template/question-detail-update-store', dataForm)
        .then(res => {
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(e => {
          setDescription('')
          setControlPoint('')
          setMasterAnswerId(null)
          setSkeleton2(true)
          setIsDisable(false)
          setOpenEditModal(false)
          setReload(!reload)
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

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Get Question Detail
  useEffect(() => {
    new Promise((resolve, reject) => {
      backendApi
        .post(
          '/web/master/question-template/question-detail-list',
          JSON.stringify({
            question_uid: id
          })
        )
        .then(res => {
          setQuestionDetail(res.data.data)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(e => setSkeleton2(false))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload])

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <PageHeader title={<Typography variant='h5'>Master Question Template</Typography>} subtitle={null} />
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={'Question'} />
            <CardContent>
              {skeleton ? (
                <Grid>
                  <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
                  <Skeleton variant='text' sx={{ fontSize: '3rem' }} />
                </Grid>
              ) : (
                <form>
                  <Grid container spacing={8}>
                    <Grid container item spacing={6}>
                      <Grid item md={3} xs={12}>
                        <TextField
                          fullWidth
                          value={masterQuestion.question_number}
                          aria-readonly
                          label='Question Number'
                          size='small'
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item md={3} xs={12}>
                        <TextField
                          fullWidth
                          value={masterQuestion.question_type}
                          aria-readonly
                          label='Question Type'
                          size='small'
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextField
                          fullWidth
                          value={masterQuestion.question_name}
                          aria-readonly
                          label='Question Name'
                          size='small'
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </form>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={
                <Grid
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography variant='h6'>Question Detail</Typography>
                  <Button variant='contained' size='small' onClick={handleClickOpenModal}>
                    Create Question
                  </Button>
                </Grid>
              }
            />
            <CardContent>
              {skeleton2 ? (
                <Grid>
                  <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
                  <Skeleton variant='text' sx={{ fontSize: '3rem' }} />
                </Grid>
              ) : (
                <Grid container spacing={8}>
                  <Grid item xs={12}>
                    <TableContainer component={Paper}>
                      <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                        <TableHead>
                          <TableRow>
                            <TableCell align='center'>
                              <b>#</b>
                            </TableCell>
                            <TableCell align='center'>
                              <b>Question</b>
                            </TableCell>
                            <TableCell align='center'>
                              <b>Control Panel</b>
                            </TableCell>
                            <TableCell align='center'>
                              <b>Master Answer</b>
                            </TableCell>
                            <TableCell align='center'>
                              <b>Action</b>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {questionDetail.length ? (
                            questionDetail.map((data, index) => (
                              <TableRow key={index}>
                                <TableCell align='center' style={{ verticalAlign: 'top' }}>
                                  {index + 1}
                                </TableCell>
                                <TableCell align='center' style={{ verticalAlign: 'top' }}>
                                  <Box>
                                    <p dangerouslySetInnerHTML={{ __html: data.question_answer_description }}></p>
                                  </Box>
                                </TableCell>
                                <TableCell align='center' style={{ verticalAlign: 'top' }}>
                                  <Box>
                                    <p dangerouslySetInnerHTML={{ __html: data.control_point }}></p>
                                  </Box>
                                </TableCell>
                                <TableCell align='center' sx={{ minWidth: 150 }}>
                                  {data.question_answer_category}
                                </TableCell>
                                <TableCell align='center' sx={{ minWidth: 150 }}>
                                  <Box>
                                    <IconButton onClick={() => handleClickOpenEditModal(data)}>
                                      <Icon icon='mdi:edit-outline' />
                                    </IconButton>
                                    <IconButton onClick={() => handleDialogToggleDelete(data)}>
                                      <Icon icon='mdi:delete-outline' />
                                    </IconButton>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell>
                                <Typography variant='subtitle2' sx={{ display: 'flex', p: 2 }}>
                                  Not data found
                                </Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Grid item>
                    <Box
                      sx={{
                        gap: 5,
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'left'
                      }}
                    >
                      <Button component={Link} href={'/question-template'} variant='outlined' size='small'>
                        Back
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Dialog Modal */}
        <Dialog
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby='form-dialog-title'
          fullWidth={true}
          maxWidth={'lg'}
        >
          <DialogTitle id='form-dialog-title'>Create Question</DialogTitle>

          <form onSubmit={handleSubmit(createHandler)}>
            <DialogContent>
              <DialogContentText sx={{ mb: 1 }}>
                {/* To subscribe to this website, please enter your email address here. We will send updates occasionally. */}
              </DialogContentText>
              <Grid container spacing={6}>
                <Grid container item md={6} rowSpacing={6}>
                  <Grid item md={12} xs={12}>
                    <TextField
                      {...register('klausul')}
                      onChange={fieldHandler}
                      fullWidth
                      name='klausul'
                      label='Ref / Klausul'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.klausul)}
                      helperText={errors.klausul && errors.klausul.message}
                    />
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <TextField
                      {...register('category')}
                      onChange={fieldHandler}
                      fullWidth
                      name='category'
                      label='Category'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.category)}
                      helperText={errors.category && errors.category.message}
                    />
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <TextField
                      {...register('subcategory')}
                      onChange={fieldHandler}
                      fullWidth
                      name='subcategory'
                      label='Sub Category'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.subcategory)}
                      helperText={errors.subcategory && errors.subcategory.message}
                    />
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <FormControl fullWidth>
                      <Autocomplete
                        size='small'
                        options={masterAnswer}
                        fullWidth
                        renderInput={params => (
                          <TextField
                            {...params}
                            {...register('question_answer_uid')}
                            label='Answer Master'
                            InputLabelProps={{ shrink: true }}
                            error={Boolean(errors.question_answer_uid)}
                          />
                        )}
                        onChange={(event, newValue) => {
                          setMasterAnswerId(newValue)
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={masterAnswerId}
                      />
                      {errors.question_answer_uid && (
                        <FormHelperText sx={{ color: 'error.main' }}>
                          {errors.question_answer_uid.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container item md={6} rowSpacing={6}>
                  <Grid item md={12} xs={12}>
                    <InputLabel sx={{ mb: 2 }}>
                      <Typography variant='body1'>Question Description</Typography>
                    </InputLabel>
                    <FormControl fullWidth>
                      <Editor
                        {...register('question_answer_description')}
                        name={'question_answer_description'}
                        initData={''}
                        onCKChange={data => {
                          setDescription(data)
                          setValue('question_answer_description', data)
                        }}
                      />
                      {errors.question_answer_description && (
                        <FormHelperText sx={{ color: 'error.main' }}>
                          {errors.question_answer_description.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <InputLabel sx={{ mb: 2 }}>
                      <Typography variant='body1'>Control Point</Typography>
                    </InputLabel>
                    <FormControl fullWidth>
                      <Editor
                        {...register('control_point')}
                        name={'control_point'}
                        initData={''}
                        onCKChange={data => {
                          setControlPoint(data)
                          setValue('control_point', data)
                        }}
                      />
                      {errors.control_point && (
                        <FormHelperText sx={{ color: 'error.main' }}>{errors.control_point.message}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions className='dialog-actions-dense'>
              <Button type='submit' variant='contained' size='small' disabled={isDisable}>
                Save Question
                {isDisable && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
              </Button>
              <Button onClick={handleCloseModal} color='error' size='small'>
                Close
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Dialog Modal Edit */}
        <Dialog
          open={openEditModal}
          onClose={handleCloseEditModal}
          aria-labelledby='form-dialog-title'
          fullWidth={true}
          maxWidth={'lg'}
        >
          <DialogTitle id='form-dialog-title'>Edit Question</DialogTitle>

          <form onSubmit={handleSubmit(editHandler)}>
            <DialogContent>
              <DialogContentText sx={{ mb: 1 }}>
                {/* To subscribe to this website, please enter your email address here. We will send updates occasionally. */}
              </DialogContentText>
              <Grid container spacing={6}>
                <Grid container item md={6} rowSpacing={6}>
                  <Grid item md={12} xs={12}>
                    <TextField
                      {...register('klausul')}
                      onChange={fieldHandler}
                      fullWidth
                      name='klausul'
                      label='Ref / Klausul'
                      size='small'
                      value={questionEditDetail.klausul}
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.klausul)}
                      helperText={errors.klausul && errors.klausul.message}
                    />
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <TextField
                      {...register('category')}
                      onChange={fieldHandler}
                      fullWidth
                      name='category'
                      label='Category'
                      size='small'
                      value={questionEditDetail.question_category1}
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.category)}
                      helperText={errors.category && errors.category.message}
                    />
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <TextField
                      {...register('subcategory')}
                      onChange={fieldHandler}
                      fullWidth
                      name='subcategory'
                      label='Sub Category'
                      size='small'
                      value={questionEditDetail.question_category2}
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.subcategory)}
                      helperText={errors.subcategory && errors.subcategory.message}
                    />
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <FormControl fullWidth>
                      <Autocomplete
                        size='small'
                        options={masterAnswer}
                        fullWidth
                        renderInput={params => (
                          <TextField
                            {...params}
                            {...register('question_answer_uid')}
                            label='Answer Master'
                            InputLabelProps={{ shrink: true }}
                            error={Boolean(errors.question_answer_uid)}
                          />
                        )}
                        onChange={(event, newValue) => {
                          setMasterAnswerId(newValue)
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={masterAnswer_Id || null}

                        // value={masterAnswerId}
                      />
                      {errors.question_answer_uid && (
                        <FormHelperText sx={{ color: 'error.main' }}>
                          {errors.question_answer_uid.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container item md={6} rowSpacing={6}>
                  <Grid item md={12} xs={12}>
                    <InputLabel sx={{ mb: 2 }}>
                      <Typography variant='body1'>Question Description</Typography>
                    </InputLabel>
                    <FormControl fullWidth>
                      <Editor
                        {...register('question_answer_description')}
                        name={'question_answer_description'}

                        // initData={''}
                        initData={questionEditDetail.question_answer_description}
                        onCKChange={data => {
                          setDescription(data)
                          setValue('question_answer_description', data)
                        }}
                      />
                      {errors.question_answer_description && (
                        <FormHelperText sx={{ color: 'error.main' }}>
                          {errors.question_answer_description.message}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <InputLabel sx={{ mb: 2 }}>
                      <Typography variant='body1'>Control Point</Typography>
                    </InputLabel>
                    <FormControl fullWidth>
                      <Editor
                        {...register('control_point')}
                        name={'control_point'}

                        // initData={''}
                        initData={questionEditDetail.control_point}
                        onCKChange={data => {
                          setControlPoint(data)
                          setValue('control_point', data)
                        }}
                      />
                      {errors.control_point && (
                        <FormHelperText sx={{ color: 'error.main' }}>{errors.control_point.message}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions className='dialog-actions-dense'>
              <Button type='submit' variant='contained' size='small' disabled={isDisable}>
                Save Question
                {isDisable && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
              </Button>
              <Button onClick={handleCloseEditModal} color='error' size='small'>
                Close
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Grid>

      <Dialog fullWidth onClose={handleDialogToggleDeleteClose} open={openDialogAdd}>
        <DialogTitle sx={{ pt: 6, mx: 'auto', textAlign: 'center' }}>
          <Typography variant='h5' component='span' sx={{ mb: 2 }}>
            Are you sure to delete data ?
          </Typography>
          <Typography variant='body2'>After you delete, you can not undo this data.</Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 6, mx: 'auto' }}>
          <form onSubmit={deleteHandler}>
            <TableContainer sx={{ mb: 6 }}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow key={dataDelete.question_detail_uid}>
                    <TableCell>{dataDelete.question_answer_description}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Box className='demo-space-x' sx={{ '& > :last-child': { mr: '0 !important', mt: 2 } }}>
              <Button size='large' type='submit' variant='contained' color='error' disabled={isLoadingDelete}>
                Delete
                {isLoadingDelete && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
              </Button>
              <Button
                type='reset'
                size='large'
                variant='outlined'
                color='secondary'
                onClick={handleDialogToggleDeleteClose}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

detailQuestion.acl = {
  action: 'manage',
  subject: 'question-template-detail'
}

export default detailQuestion
