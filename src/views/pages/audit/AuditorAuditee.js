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

const AuditorAuditee = props => {
  const { id } = props

  const [skeleton, setSkeleton] = useState(true)
  const [auditor, setAuditor] = useState([])
  const [auditee, setAuditee] = useState([])

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
          setAuditor(res.data.data.auditor)
          setAuditee(res.data.data.auditee)
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
        <CardHeader title={'Auditee & Auditor'} />
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
                  <TableContainer component={Paper}>
                    <Table aria-label='simple table' size={'small'}>
                      <TableHead>
                        <TableRow>
                          <TableCell width={20}>#</TableCell>
                          <TableCell align='left'>Auditee</TableCell>
                          <TableCell align='right'>Title</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {auditee.length ? (
                          auditee.map((data, index) => (
                            <TableRow key={index}>
                              <TableCell align='left' style={{ verticalAlign: 'top' }}>
                                {index + 1}
                              </TableCell>
                              <TableCell align='left' style={{ verticalAlign: 'top' }}>
                                {data.auditee_name}
                              </TableCell>
                              <TableCell align='right' style={{ verticalAlign: 'top' }}>
                                {data.auditee_type}
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
                <Grid item md={6} xs={12}>
                  <TableContainer component={Paper}>
                    <Table aria-label='simple table' size={'small'}>
                      <TableHead>
                        <TableRow>
                          <TableCell width={20}>#</TableCell>
                          <TableCell align='left'>Auditor</TableCell>
                          <TableCell align='right'>Title</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {auditor.length ? (
                          auditor.map((data, index) => (
                            <TableRow key={index}>
                              <TableCell align='left' style={{ verticalAlign: 'top' }}>
                                {index + 1}
                              </TableCell>
                              <TableCell align='left' style={{ verticalAlign: 'top' }}>
                                {data.auditor_name}
                              </TableCell>
                              <TableCell align='right' style={{ verticalAlign: 'top' }}>
                                {data.auditor_type}
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

export default AuditorAuditee
