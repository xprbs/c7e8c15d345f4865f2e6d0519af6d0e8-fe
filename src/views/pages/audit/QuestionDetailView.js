import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
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
  Typography
} from '@mui/material'

import { styled } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import CardHeader from '@mui/material/CardHeader'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { backendApi } from 'src/configs/axios'
import dynamic from 'next/dynamic'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const QuestionDetailView = props => {
  const { id } = props

  const [skeleton, setSkeleton] = useState(true)
  const [questionDetail, setQuestionDetail] = useState([])
  const [auditId, setAuditId] = useState(null)
  const [questionId, setQuestionId] = useState(null)
  const [questionDetailId, setQuestionDetailId] = useState(null)
  const [noteDescription, setNoteDescription] = useState('')
  const [auditAnswer, setAuditAnswer] = useState([])
  const [selectedDetail, setSelectedDetail] = useState([])
  const [isDisable, setIsDisable] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [note, setNote] = useState([])
  const [isNoteLoading, setIsNoteLoading] = useState(false)

  useEffect(() => {
    new Promise((resolve, reject) => {
      backendApi
        .post(
          '/web/audit-checklist/get-detail',
          JSON.stringify({
            id: id
          })
        )
        .then(res => {
          resolve('success')
          getQuestionDetail(res.data.data.audit_uid, res.data.data.question_uid)
          setAuditId(res.data.data.audit_uid)
          setQuestionId(res.data.data.question_uid)
          setTimeout(() => {
            getAuditAnswer(res.data.data.audit_uid, res.data.data.question_uid)
          }, [1000])
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getQuestionDetail = async (audit_uid, question_uid) => {
    new Promise((resolve, reject) => {
      backendApi
        .post(
          '/web/master/question-template/question-detail-list',
          JSON.stringify({
            question_uid,
            audit_uid
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
        .finally(e => setSkeleton(false))
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
        .finally(e => setSkeleton(false))
    })
  }

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

  const handleNoteStore = async (audit_uid, question_uid, question_detail_uid) => {
    setIsDisable(true)

    const dataForm = JSON.stringify({
      audit_uid: audit_uid,
      question_uid: question_uid,
      question_detail_uid: question_detail_uid,
      note: noteDescription
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/approval/approval-note-store', dataForm)
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
          getNote(audit_uid, question_uid, question_detail_uid)
          getQuestionDetail(audit_uid, question_uid)
        })
    })

    toast.promise(myPromise, {
      loading: 'Loading',
      success: 'Successfully save note',
      error: error => {
        if (error.response.status === 500) return error.response.data.response

        return 'Something error'
      }
    })
  }

  return (
    <Grid item xs={12}>
      <Card>
        <CardContent>
          {skeleton ? (
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
                                    Klausul :
                                  </Typography>
                                  {data.klausul}
                                </Box>
                                <Box>
                                  <Typography variant='overline' color={'primary'}>
                                    Category :
                                  </Typography>
                                  {data.question_category1}
                                </Box>
                                <Box>
                                  <Typography variant='overline' color={'primary'}>
                                    Sub Category :
                                  </Typography>
                                  {data.question_category2}
                                </Box>
                                <Box sx={{ minWidth: 250 }}>
                                  <Typography variant='overline' color={'primary'}>
                                    Question :
                                  </Typography>
                                  <p dangerouslySetInnerHTML={{ __html: data.question_answer_description }}></p>
                                </Box>
                              </TableCell>
                              <TableCell align='left' style={{ verticalAlign: 'top' }}>
                                <Box sx={{ minWidth: 250 }}>
                                  <Typography variant='overline' color={'primary'}>
                                    Control Point :
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
                                      InputProps={{
                                        readOnly: true
                                      }}
                                      InputLabelProps={{ shrink: true }}
                                      sx={{ minWidth: 350, mt: 2 }}
                                      defaultValue={selectedDetail
                                        .map(e => (e.id === data.question_detail_uid ? e.answer_description : null))
                                        .join('')}
                                    />
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
                          <TableRow>
                            <TableCell align='left' style={{ verticalAlign: 'top' }}>
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
              </Grid>
            </form>
          )}
        </CardContent>
      </Card>

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
        <Grid>
          <Grid sx={{ p: 4 }}>
            <FormControl fullWidth>
              {/* <Editor
                name={'note_description'}
                initData={''}
                onCKChange={data => {
                  console.log(data)
                  setNoteDescription('manual')
                }}
              /> */}

              <TextField
                name={'note_description'}
                value={noteDescription}
                multiline
                rows={3}
                fullWidth
                label='Note'
                size='small'
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 350, mt: 2 }}
                onChange={e => {
                  // console.log(e.target.value)
                  setNoteDescription(e.target.value)
                }}
              />
            </FormControl>
            <Grid sx={{ mt: 4 }}>
              <Button
                variant='contained'
                size='small'
                disabled={isDisable}
                onClick={() => handleNoteStore(auditId, questionId, questionDetailId)}
              >
                Save
                {isDisable && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
              </Button>
              <Button size='small' onClick={handleCloseModal}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Dialog>
    </Grid>
  )
}

export default QuestionDetailView
