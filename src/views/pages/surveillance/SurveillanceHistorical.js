import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { backendApi } from 'src/configs/axios'

const ApprovalList = props => {
  const { id } = props

  const [skeleton, setSkeleton] = useState(true)
  const [approval, setApproval] = useState([])

  useEffect(() => {
    new Promise((resolve, reject) => {
      backendApi
        .post(
          '/web/surveillance/history-get',
          JSON.stringify({
            project_uid: id
          })
        )
        .then(res => {
          resolve('success')
          setApproval(res.data.data)
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(() => {
          setSkeleton(false)
        })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid item xs={12}>
      <Card>
        {/* <CardHeader title={'Approval Info'} /> */}
        <CardContent>
          {skeleton ? (
            <Grid>
              <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
              <Skeleton variant='text' sx={{ fontSize: '3rem' }} />
            </Grid>
          ) : (
            <Grid container spacing={6}>
              <Grid container item spacing={6}>
                <Grid item md={12} xs={12}>
                  <TableContainer component={Paper}>
                    <Table aria-label='simple table' size={'small'}>
                      <TableHead>
                        <TableRow>
                          <TableCell width={20}>#</TableCell>
                          <TableCell align='left'>Name</TableCell>
                          <TableCell align='right'>Status</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Message</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {approval.length ? (
                          approval.map((data, index) => (
                            <TableRow key={index}>
                              <TableCell align='left' style={{ verticalAlign: 'top' }}>
                                {index + 1}
                              </TableCell>
                              <TableCell align='left' style={{ verticalAlign: 'top' }}>
                                {data.created_by}
                              </TableCell>
                              <TableCell align='right' style={{ verticalAlign: 'top' }}>
                                {data.doc_type}
                              </TableCell>
                              <TableCell style={{ verticalAlign: 'top' }}>{data.created_date}</TableCell>
                              <TableCell style={{ verticalAlign: 'top' }}>
                                <p dangerouslySetInnerHTML={{ __html: data.note }}></p>
                                {data.path ? (
                                  <p>
                                    <a
                                      href={process.env.NEXT_PUBLIC_URL_BACKEND_PATH + data.path}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                    >
                                      Attachment
                                    </a>
                                  </p>
                                ) : (
                                  ''
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
            </Grid>
          )}
        </CardContent>
      </Card>
    </Grid>
  )
}

export default ApprovalList
