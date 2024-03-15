import React, { useEffect, useLayoutEffect, useState } from 'react'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import Link from 'next/link'

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
  const [auditAnswer, setAuditAnswer] = useState([])
  const [selectedDetail, setSelectedDetail] = useState([])

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
          getQuestionDetail(res.data.data.question_uid)
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

  const createHandler = async () => {
    setIsDisable(true)

    const dataForm = JSON.stringify({
      audit_uid: detail.audit_uid,
      question_uid: detail.question_uid,
      details: selectedDetail
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

  const [auditorData, setAuditorData] = useState([])
  const [auditeeData, setAuditeeData] = useState([])

  const datakeyForm = JSON.stringify({
    id: id
  })

  const fetchData = async () => {
    try {
      const response = await backendApi.post('/web/audit-checklist/get-detail', datakeyForm)
      const { auditor, auditee } = response.data.data

      // Proses data auditee
      const processedAuditeeData = auditee.map((item, index) => ({
        id: index, // Atau gunakan properti unik lainnya
        auditee_name: item.auditee_name,
        auditee_type: item.auditee_type
      }))

      // Proses data auditor
      const processedAuditorData = auditor.map((item, index) => ({
        id: index, // Atau gunakan properti unik lainnya
        auditor_name: item.auditor_name,
        auditor_type: item.auditor_type
      }))

      setAuditorData(processedAuditorData)
      setAuditeeData(processedAuditeeData)
      setSkeleton(false)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const columnsAuditor = [
    {
      flex: 0.75,
      minWidth: 100,
      field: 'auditor_name',
      headerName: 'Auditor Name',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Auditor Name</Typography>
    },
    {
      flex: 0.75,
      minWidth: 100,
      field: 'auditor_type',
      headerName: 'Auditor Type',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Auditor Type</Typography>
    }
  ]

  const columnsAuditee = [
    {
      flex: 0.75,
      minWidth: 100,
      field: 'auditee_name',
      headerName: 'Auditee Name',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Auditee Name</Typography>
    },
    {
      flex: 0.75,
      minWidth: 100,
      field: 'auditee_type',
      headerName: 'Auditee Type',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Auditee Type</Typography>
    }
  ]

  const CustomPagination = () => null

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>Process Audit</Typography>}></PageHeader>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={'Audit Info'} />
          <CardContent>
            {skeleton ? (
              <Grid>
                <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
                <Skeleton variant='text' sx={{ fontSize: '3rem' }} />
              </Grid>
            ) : (
              <Grid container spacing={6}>
                <Grid container item spacing={6}>
                  <Grid item md={1} xs={12}>
                    <TextField
                      fullWidth
                      value={detail.dataAreaId}
                      aria-readonly
                      label='Company'
                      size='small'
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
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
                  <Grid item md={3} xs={12}>
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
          <CardHeader title={'Auditor & Auditee Info'} />
          <CardContent>
            {skeleton ? (
              <Grid>
                <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
                <Skeleton variant='text' sx={{ fontSize: '3rem' }} />
              </Grid>
            ) : (
              <Grid container spacing={6}>
                <Grid container item spacing={6}>
                  <Grid item md={6} xs={12}>
                    <DataGrid
                      autoHeight
                      rowHeight={40}
                      columns={columnsAuditor}
                      getRowId={row => row.id}
                      rows={auditorData}
                      pagination={false}
                      components={{
                        Pagination: CustomPagination
                      }}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <DataGrid
                      autoHeight
                      rowHeight={40}
                      columns={columnsAuditee}
                      getRowId={row => row.id}
                      rows={auditeeData}
                      pagination={false}
                      components={{
                        Pagination: CustomPagination
                      }}
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
                      <Button onClick={e => createHandler()} variant='contained' size='small' disabled={isDisable}>
                        Save as Draft
                        {isDisable && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
                      </Button>
                      <Button component={Link} href={'#'} variant='contained' size='small'>
                        Submit
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
