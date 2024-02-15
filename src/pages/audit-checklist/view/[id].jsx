import React, { useEffect, useState } from 'react'

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
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
  Typography
} from '@mui/material'

const AuditIsoViewPage = () => {
  const router = useRouter()
  const { id } = router.query

  const [skeleton, setSkeleton] = useState(true)
  const [skeleton2, setSkeleton2] = useState(true)
  const [isDisable, setIsDisable] = useState(false)
  const [detail, setDetail] = useState([])
  const [questionDetail, setQuestionDetail] = useState([])
  const [selectedDetail, setSelectedDetail] = useState({})
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [description, setDescription] = useState({})

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
          getQuestionDetail(res.data.data.question_uid)
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

  const getQuestionDetail = async param => {
    new Promise((resolve, reject) => {
      backendApi
        .post(
          '/web/master/question-template/question-detail-list',
          JSON.stringify({
            question_uid: param ?? null
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

  const createHandler = async () => {
    setIsDisable(true)

    const dataForm = JSON.stringify({
      audit_uid: detail.audit_uid,
      question_uid: detail.question_uid,
      question_detail_uid: questionDetail.question_detail_uid,
      answer: questionDetail.answer,
      answer_description: questionDetail.answer_description
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/audit-checklist/answer-store', dataForm)
        .then(res => {
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(e => {
          setIsDisable(true)
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

  const handleAnswer = (id, answer) => {
    setSelectedAnswers(pre => ({ ...pre, [id]: answer }))
  }

  const handleDesc = (id, desc) => {
    setDescription(pre => ({ ...pre, [id]: desc }))
  }

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>Process Audit</Typography>}></PageHeader>
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
              <Grid container spacing={6}>
                <Grid container item spacing={6}>
                  <Grid item md={2} xs={12}>
                    <TextField
                      fullWidth
                      value={detail.audit_number}
                      aria-readonly
                      label='Audit Number'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item md={4} xs={12}>
                    <TextField
                      fullWidth
                      value={detail.audit_name}
                      aria-readonly
                      label='Audit Name'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item md={3} xs={12}>
                    <TextField
                      fullWidth
                      value={detail.audit_location}
                      aria-readonly
                      label='Audit Location'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item md={3} xs={12}>
                    <TextField
                      fullWidth
                      value={detail.question_name}
                      aria-readonly
                      label='Question Template'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            {skeleton2 ? (
              <Grid>
                <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
                <Skeleton variant='text' sx={{ fontSize: '3rem' }} />
              </Grid>
            ) : (
              <form onSubmit={createHandler}>
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
                                    <Typography variant='overline'>Klausul : {data.klausul}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant='overline'>Category : {data.question_category1}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant='overline'>Sub Category : {data.question_category2}</Typography>
                                  </Box>
                                  <Box sx={{ minWidth: 250 }}>
                                    <Typography variant='overline'>Question : </Typography>
                                    <p dangerouslySetInnerHTML={{ __html: data.question_answer_description }}></p>
                                  </Box>
                                </TableCell>
                                <TableCell align='left' style={{ verticalAlign: 'top' }}>
                                  <Box sx={{ minWidth: 250 }}>
                                    <Typography variant='overline'>Control Point : </Typography>
                                    <p dangerouslySetInnerHTML={{ __html: data.control_point }}></p>
                                  </Box>
                                </TableCell>
                                <TableCell style={{ verticalAlign: 'top' }}>
                                  <Box
                                    sx={{
                                      border: 0,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      justifyContent: 'flex-end',
                                      alignItems: 'flex-end'
                                    }}
                                  >
                                    <RadioGroup row>
                                      {Object.create(data.answer).map(row => (
                                        <FormControlLabel
                                          key={row.id}
                                          name={`answer_${row.id}`}
                                          value={row.question_answer_key}
                                          label={row.question_answer_description}
                                          control={<Radio color={row.color} />}
                                          onChange={() =>
                                            handleAnswer(data.question_detail_uid, row.question_answer_key)
                                          }
                                        />
                                      ))}
                                    </RadioGroup>
                                    <TextField
                                      name={`answer_description_${data.question_detail_uid}`}
                                      multiline
                                      rows={3}
                                      fullWidth
                                      label='Note'
                                      size='small'
                                      InputLabelProps={{ shrink: true }}
                                      sx={{ minWidth: 350, mt: 2 }}
                                      onChange={e => handleDesc(data.question_detail_uid, e.target.value)}
                                    />
                                  </Box>
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
                      <Button component={Link} href={'/audit-checklist'} variant='outlined' size='small'>
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
