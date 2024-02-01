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
  const [answer, setAnswer] = useState([])

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

  const getAnswer = async param => {
    new Promise((resolve, reject) => {
      backendApi
        .post(
          '/web/audit-checklist/get-master-answer-id',
          JSON.stringify({
            id: param ?? null
          })
        )
        .then(res => {
          setAnswer(res.data.data)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(e => setSkeleton2(false))
    })
  }

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>View Audit</Typography>}></PageHeader>
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
              </form>
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
              <Grid container spacing={6}>
                <Grid item xs={12}>
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label='simple table' size={'small'}>
                      <TableHead>
                        <TableRow>
                          <TableCell width={'1'}>#</TableCell>
                          <TableCell>Question</TableCell>
                          <TableCell align='right'>Answer</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {questionDetail.length ? (
                          questionDetail.map((data, index) => (
                            <TableRow key={index}>
                              <TableCell align='left'>{index + 1}</TableCell>
                              <TableCell align='left' component='th' scope='row'>
                                {data.question_answer_description}
                              </TableCell>
                              <TableCell align='right' sx={{ display: 'flex', justifyContent: 'right' }}>
                                <RadioGroup row aria-label='colored' name='colored' defaultValue='0'>
                                  {Object.create(data.answer).map(row => (
                                    <FormControlLabel
                                      key={row.id}
                                      value={row.question_answer_key}
                                      label={row.question_answer_description}
                                      control={<Radio color={row.color} />}
                                    />
                                  ))}
                                </RadioGroup>
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
                    <Button component={Link} href={'/audit-iso'} variant='outlined' size='small'>
                      Back
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

AuditIsoViewPage.acl = {
  subject: 'audit-iso-view',
  action: 'manage'
}

export default AuditIsoViewPage
