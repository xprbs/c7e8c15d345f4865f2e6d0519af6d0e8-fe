import React, { useEffect, useLayoutEffect, useState } from 'react'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import Link from 'next/link'
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, setValue } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { DataGrid } from '@mui/x-data-grid'
import { useAuth } from 'src/hooks/useAuth'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { backendApi } from 'src/configs/axios'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  // CardHeader,
  CircularProgress,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  FormControl
} from '@mui/material'

import { styled } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import CardHeader from '@mui/material/CardHeader'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
import dynamic from 'next/dynamic'

import AuditInfo from 'src/views/pages/audit/AuditInfo'
import AuditorAuditee from 'src/views/pages/audit/AuditorAuditee'
import ApprovalList from 'src/views/pages/audit/ApprovalList'
import FileUploaderRestrictions from 'src/views/file-uploader/FileUploaderRestrictions'
import CardSnippet from 'src/@core/components/card-snippet'

// ** Source code imports
import * as source from 'src/views/file-uploader/FileUploaderSourceCode'

const AuditIsoViewPage = () => {
  const router = useRouter()
  const { id } = router.query

  const [skeleton, setSkeleton] = useState(true)
  const [skeleton2, setSkeleton2] = useState(true)
  const [isDisable, setIsDisable] = useState(false)
  const [detail, setDetail] = useState([])
  const [questionDetail, setQuestionDetail] = useState([])
  const [auditAnswer, setAuditAnswer] = useState([])
  const [selectedDetail, setSelectedDetail] = useState([])
  const [questionDetailId, setQuestionDetailId] = useState(null)
  const [auditId, setAuditId] = useState(null)
  const [questionId, setQuestionId] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [note, setNote] = useState([])
  const [isNoteLoading, setIsNoteLoading] = useState(false)
  const [noteDescription, setNoteDescription] = useState('')

  // console.log(auditAnswer)
  // console.log(selectedDetail)

  const getData = async () => {
    setSkeleton(true)
    setSkeleton2(true)

    const dataForm = JSON.stringify({
      id: id
    })

    new Promise((resolve, reject) => {
      backendApi
        .post('/web/audit-checklist/get-detail', dataForm)
        .then(res => {
          resolve('success')
          setDetail(res.data.data)
          setQuestionId(res.data.data.question_uid)
          setAuditId(res.data.data.audit_uid)
          getQuestionDetail(res.data.data.question_uid, res.data.data.audit_uid)
          setTimeout(() => {
            getAuditAnswer(res.data.data.audit_uid, res.data.data.question_uid)
          }, [1000])
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(() => {
          setSkeleton(false)
        })
    })
  }

  const getQuestionDetail = async (param, param2) => {
    new Promise((resolve, reject) => {
      backendApi
        .post(
          '/web/master/question-template/question-detail-list',
          JSON.stringify({
            question_uid: param ?? null,
            audit_uid: param2 ?? null
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
  }

  const getAuditAnswer = async (audit_uid, question_uid) => {
    new Promise((resolve, reject) => {
      backendApi
        .post(
          '/web/audit-checklist/get-answer',
          JSON.stringify({
            audit_uid: audit_uid ?? null,
            question_uid: question_uid ?? null
          })
        )
        .then(res => {
          setAuditAnswer(res.data.data)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(e => setSkeleton2(false))
    })
  }

  const Timeline = styled(MuiTimeline)({
    paddingLeft: 0,
    paddingRight: 0,
    '& .MuiTimelineItem-root': {
      width: '100%',
      '&:before': {
        display: 'none'
      }
    }
  })

  var Editor = dynamic(() => import('src/views/editor/cke-editor'), {
    ssr: false
  })

  const handleClickOpenModal = (audit_uid, question_uid, question_detail_uid) => {
    setOpenModal(true)
    setQuestionDetailId(question_detail_uid)
    getNote(audit_uid, question_uid, question_detail_uid)
  }

  const getNote = (audit_uid, question_uid, question_detail_uid) => {
    setIsNoteLoading(true)
    new Promise((resolve, reject) => {
      backendApi
        .post(
          '/web/approval/approval-note-get',
          JSON.stringify({
            audit_uid: audit_uid ?? null,
            question_uid: question_uid ?? null,
            question_detail_uid: question_detail_uid ?? null
          })
        )
        .then(res => {
          setNote(res.data.data)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(e => setIsNoteLoading(false))
    })
  }

  const handleCloseModal = () => setOpenModal(false)

  const createHandler = async () => {
    setIsDisable(true)

    const formData = new FormData()

    formData.append('audit_uid', detail.audit_uid)
    formData.append('question_uid', detail.question_uid)
    formData.append('is_submit', is_submit)

    selectedDetail.forEach((d, i) => {
      formData.append(`details[${i}][id]`, d.id ?? '')
      formData.append(`details[${i}][answer]`, d.answer ?? '')
      formData.append(`details[${i}][answer_description]`, d.answer_description ?? '')

      if (d.file_uploads) {
        let idx = 0
        for (const dt of d.file_uploads) {
          formData.append(`details[${i}][file_uploads][${idx}][files]`, dt)
          idx++
        }
      }

      // d.file_uploads.forEach((dt, idx) => {
      // d.file_uploads.some((dt, idx) => {
      //   formData.append(`details[${i}][file_uploads][${idx}][files]`, dt)
      // })
    })

    // formData.append('files', imgsSrc)

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/audit-checklist/answer-store', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then(res => {
          if (is_submit === 1) {
            router.push('/audit-checklist')
          }
          getQuestionDetail(detail.question_uid, detail.audit_uid)
          clearUploadFile()
        })
        .then(res => {
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(() => {
          setNoteDescription('')
          setIsDisable(false)
        })
    })

    toast.promise(myPromise, {
      loading: 'Loading',
      success: 'Successfully saved',
      error: error => {
        // if (error.response.status === 500) return error.response.data.response

        return 'Something error'
      }
    })
  }

  const createHandlerMassage = async (audit_uid, question_uid, question_detail_uid, is_submit) => {
    setIsDisable(true)

    const dataForm = JSON.stringify({
      audit_uid: audit_uid,
      question_uid: question_uid,
      question_detail_uid: question_detail_uid,
      note: noteDescription
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/approval/approval-note-store', dataForm, {})
        .then(res => {
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(() => {
          setNoteDescription('')
          setIsDisable(false)
        })
    })

    toast.promise(myPromise, {
      loading: 'Loading',
      success: 'Successfully saved',
      error: error => {
        // if (error.response.status === 500) return error.response.data.response

        return 'Something error'
      }
    })
  }

  const removeFileAPI = async id => {
    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post(
          '/web/audit-checklist/delete-file',
          JSON.stringify({
            id: id ?? null
          })
        )
        .then(res => {
          getQuestionDetail(detail.question_uid, detail.audit_uid)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(e => setSkeleton2(false))
    })

    toast.promise(myPromise, {
      loading: 'Loading',
      success: 'Successfully delete',
      error: error => {
        if (error.response.status === 500) return error.response.data.response

        return 'Something error'
      }
    })
  }

  const handleChange = (e, i) => {
    const { name, value } = e.target
    const onChangeValue = [...selectedDetail]
    onChangeValue[i][name] = value
    setSelectedDetail(onChangeValue)
  }

  useLayoutEffect(() => {
    getData()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setSelectedDetail([])
    questionDetail.map((row, i) => {
      const answer_x = auditAnswer.find(e => e.question_detail_uid === row.question_detail_uid)
      setSelectedDetail(prev => [
        ...prev,
        {
          id: row.question_detail_uid,
          answer: answer_x?.answer ?? null,
          answer_description: answer_x?.answer_description ?? null
        }
      ])
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditAnswer])

  // console.log(selectedDetail)

  const onChangeUploadFile = (e, i) => {
    // for (const file of e.target.files) {
    //   setImgsSrc(imgs => [...imgs, file])
    // }

    const data = []
    for (let i = 0; i < e.target.files.length; i++) {
      data.push(e.target.files[i])
    }

    const onChangeValue = [...selectedDetail]
    onChangeValue[i]['file_uploads'] = [...(onChangeValue[i]['file_uploads'] || []), ...data]

    setSelectedDetail(onChangeValue)
    console.log(onChangeValue)
  }

  const clearUploadFile = () => {
    const onChangeValue = [...selectedDetail]

    const onChangeValues = onChangeValue.map(d => {
      d.file_uploads = []

      return d
    })

    setSelectedDetail(onChangeValues)
  }

  const removeFile = (index, i) => {
    const onChangeValue = [...selectedDetail]
    onChangeValue[index]['file_uploads'] = onChangeValue[index]['file_uploads'].filter((d, ind) => ind !== i)

    setSelectedDetail(onChangeValue)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>Process Audit</Typography>}></PageHeader>
      </Grid>
      <AuditInfo id={id} />
      <AuditorAuditee id={id} />
      <Grid item xs={12}>
        <Card>
          <CardContent>
            {skeleton2 ? (
              <Grid>
                <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
                <Skeleton variant='text' sx={{ fontSize: '3rem' }} />
              </Grid>
            ) : (
              <form>
                <Grid container spacing={6}>
                  <Grid item xs={12}>
                    <TableContainer component={Paper}>
                      <Table aria-label='simple table' size={'small'}>
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell align='left'>Question</TableCell>
                            <TableCell align='left'>Control Point</TableCell>
                            <TableCell align='right'>Answer</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {questionDetail.length ? (
                            questionDetail.map((data, index) => (
                              <TableRow key={index}>
                                <TableCell align='left' style={{ verticalAlign: 'top' }}>
                                  {index + 1}
                                </TableCell>
                                <TableCell align='left' style={{ verticalAlign: 'top' }}>
                                  <Box>
                                    <Typography variant='overline' color={'primary'}>
                                      Klausul :{' '}
                                    </Typography>{' '}
                                    {data.klausul}
                                  </Box>
                                  <Box>
                                    <Typography variant='overline' color={'primary'}>
                                      Category :{' '}
                                    </Typography>{' '}
                                    {data.question_category1}
                                  </Box>
                                  <Box>
                                    <Typography variant='overline' color={'primary'}>
                                      Sub Category :{' '}
                                    </Typography>{' '}
                                    {data.question_category2}
                                  </Box>
                                  <Box sx={{ minWidth: 250 }}>
                                    <Typography variant='overline' color={'primary'}>
                                      Question :{' '}
                                    </Typography>
                                    <p dangerouslySetInnerHTML={{ __html: data.question_answer_description }}></p>
                                  </Box>
                                </TableCell>
                                <TableCell align='left' style={{ verticalAlign: 'top' }}>
                                  <Box sx={{ minWidth: 250 }}>
                                    <Typography variant='overline' color={'primary'}>
                                      Control Point :{' '}
                                    </Typography>
                                    <p dangerouslySetInnerHTML={{ __html: data.control_point }}></p>
                                  </Box>
                                </TableCell>
                                <TableCell style={{ verticalAlign: 'top' }}>
                                  {selectedDetail.length ? (
                                    <Box
                                      sx={{
                                        border: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'flex-end',
                                        alignItems: 'flex-end'
                                      }}
                                    >
                                      <RadioGroup
                                        row
                                        value={selectedDetail
                                          .map(e => (e.id === data.question_detail_uid ? e.answer : null))
                                          .join('')}
                                      >
                                        {Object.create(data.answer).map(row => (
                                          <FormControlLabel
                                            key={row.id}
                                            name={'answer'}
                                            value={row.question_answer_key}
                                            label={row.question_answer_description}
                                            control={<Radio color={row.color} />}
                                            onChange={e => handleChange(e, index)}
                                          />
                                        ))}
                                      </RadioGroup>
                                      <TextField
                                        name={'answer_description'}
                                        multiline
                                        rows={3}
                                        fullWidth
                                        label='Note'
                                        size='small'
                                        InputLabelProps={{ shrink: true }}
                                        sx={{ minWidth: 350, mt: 2 }}
                                        onChange={e => handleChange(e, index)}
                                        defaultValue={selectedDetail
                                          .map(e => (e.id === data.question_detail_uid ? e.answer_description : null))
                                          .join('')}
                                      />
                                      <Grid item sx={{ textAlign: 'right' }}>
                                        <Button
                                          component='label'
                                          role={undefined}
                                          variant='contained'
                                          tabIndex={-1}
                                          startIcon={<Icon icon={'material-symbols:upload'} />}
                                          size='small'
                                          sx={{ marginTop: 5 }}
                                        >
                                          Upload file
                                          <input
                                            hidden
                                            onChange={e => onChangeUploadFile(e, index)}
                                            type='file'
                                            name='file'
                                            multiple
                                          />
                                        </Button>
                                        <Grid sx={{ p: 2, py: 3 }}>
                                          <Badge
                                            badgeContent={data.count_note}
                                            color={'error'}
                                            onClick={() =>
                                              handleClickOpenModal(auditId, questionId, data.question_detail_uid)
                                            }
                                            sx={{ cursor: 'pointer' }}
                                          >
                                            <Icon icon='tabler:message-dots' />
                                          </Badge>
                                        </Grid>
                                        <Table cellpadding='3'>
                                          {data.files &&
                                            data.files.map((d, i) => (
                                              <tr key={i}>
                                                <td valign='middle'>
                                                  <a
                                                    href={process.env.NEXT_PUBLIC_URL_BACKEND_PATH + d.filepath}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                  >
                                                    {d.filename}
                                                  </a>
                                                </td>
                                                <td>
                                                  <Icon
                                                    onClick={() => removeFileAPI(d.id)}
                                                    icon={'material-symbols:delete'}
                                                    color='red'
                                                    className='cursor-pointer'
                                                  />
                                                </td>
                                              </tr>
                                            ))}
                                          {selectedDetail[index].file_uploads &&
                                            selectedDetail[index].file_uploads.map((d, i) => (
                                              <tr key={i}>
                                                <td valign='middle'>{d.name}</td>
                                                <td>
                                                  <Icon
                                                    onClick={() => removeFile(index, i)}
                                                    icon={'material-symbols:delete'}
                                                    color='orange'
                                                    sx={{ cursor: 'pointer' }}
                                                  />
                                                </td>
                                              </tr>
                                            ))}
                                        </Table>
                                      </Grid>
                                    </Box>
                                  ) : (
                                    <Grid
                                      sx={{
                                        border: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'flex-end',
                                        alignItems: 'flex-end'
                                      }}
                                    >
                                      <Skeleton variant='text' sx={{ fontSize: '1rem', width: '350px' }} />
                                    </Grid>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <Typography variant='subtitle2' sx={{ display: 'flex', p: 2 }}>
                              Not data found
                            </Typography>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  <Dialog
                    open={openModal}
                    onClose={handleCloseModal}
                    aria-labelledby='form-dialog-title'
                    scroll={'paper'}
                    fullWidth={true}
                    maxWidth={'lg'}
                  >
                    <DialogTitle id='scroll-dialog-title'>Note History</DialogTitle>
                    {isNoteLoading ? (
                      <Grid sx={{ p: 4 }}>
                        <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
                        <Skeleton variant='text' sx={{ fontSize: '3rem' }} />
                      </Grid>
                    ) : (
                      <DialogContent dividers={scroll === 'paper'}>
                        {note.length ? (
                          note.map((data, index) => (
                            <Timeline key={index} sx={{ my: 0, py: 0 }}>
                              <TimelineItem>
                                <TimelineSeparator>
                                  <TimelineDot color='warning' />
                                  <TimelineConnector />
                                </TimelineSeparator>
                                <TimelineContent sx={{ mt: 0, mb: theme => `${theme.spacing(2)} !important` }}>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      flexWrap: 'wrap',
                                      alignItems: 'center',
                                      justifyContent: 'space-between'
                                    }}
                                  >
                                    <Typography sx={{ mr: 2, fontWeight: 500 }}>{data.created_by}</Typography>
                                    <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                                      {data.created_at}
                                    </Typography>
                                  </Box>
                                  <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                                    <a dangerouslySetInnerHTML={{ __html: data.note }}></a>
                                  </Typography>
                                </TimelineContent>
                              </TimelineItem>
                            </Timeline>
                          ))
                        ) : (
                          <Typography variant='subtitle2' sx={{ display: 'flex', p: 2 }}>
                            No data found
                          </Typography>
                        )}
                      </DialogContent>
                    )}
                    <FormControl fullWidth>
                      <TextField
                        name={'note_description'}
                        value={noteDescription}
                        multiline
                        rows={3}
                        fullWidth
                        label='Note'
                        size='small'
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 320, mt: 2 }}
                        onChange={e => {
                          // console.log(e.target.value)
                          setNoteDescription(e.target.value)
                        }}
                      />
                    </FormControl>
                    <Grid item sx={{ mt: 4, mb: 4, ml: 4 }}>
                      <Box
                        sx={{
                          gap: 5,
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'left'
                        }}
                      >
                        <Button
                          onClick={e => createHandlerMassage(auditId, questionId, questionDetailId)}
                          variant='contained'
                          size='small'
                          disabled={isDisable}
                        >
                          Save
                          {isDisable && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
                        </Button>
                        <Button size='small' onClick={handleCloseModal}>
                          Cancel
                        </Button>
                      </Box>
                    </Grid>
                  </Dialog>
                  <Grid item sx={{ mt: 4 }}>
                    <Box
                      sx={{
                        gap: 5,
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'left'
                      }}
                    >
                      <Button component={Link} href={'/audit-checklist'} variant='outlined' size='small'>
                        Back
                      </Button>
                      <Button onClick={e => createHandler(0)} variant='contained' size='small' disabled={isDisable}>
                        Save as Draft
                        {isDisable && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
                      </Button>
                      <Button onClick={e => createHandler(1)} variant='contained' size='small' disabled={isDisable}>
                        Submit for approval
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

AuditIsoViewPage.acl = {
  action: 'manage',
  subject: 'audit-checklist-view'
}

export default AuditIsoViewPage
