import {
  Box,
  Card,
  CardContent,
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
import React, { useEffect, useState } from 'react'
import { backendApi } from 'src/configs/axios'

const QuestionDetailView = props => {
  const { id } = props

  const [skeleton, setSkeleton] = useState(true)
  const [questionDetail, setQuestionDetail] = useState([])
  const [auditAnswer, setAuditAnswer] = useState([])
  const [selectedDetail, setSelectedDetail] = useState([])

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
          getQuestionDetail(res.data.data.question_uid)
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
              </Grid>
            </form>
          )}
        </CardContent>
      </Card>
    </Grid>
  )
}

export default QuestionDetailView
