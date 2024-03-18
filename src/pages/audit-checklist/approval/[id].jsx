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
  const [detail, setDetail] = useState([])
  const [approval, setApproval] = useState([])

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
          setTimeout(() => {
            getAuditApproval(res.data.data.audit_uid)
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

  const getAuditApproval = async id => {
    new Promise((resolve, reject) => {
      backendApi
        .post(
          '/web/audit-checklist/get-approval',
          JSON.stringify({
            audit_uid: id
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
          setSkeleton2(false)
        })
    })
  }

  useLayoutEffect(() => {
    getData()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>Approval Audit</Typography>}></PageHeader>
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
                  <Grid item md={1.5} xs={12}>
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
                  <Grid item md={2.5} xs={12}>
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
          <CardHeader title={'Approval Info'} />
          <CardContent>
            {skeleton2 ? (
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
                            <TableCell align='right'>Workflow</TableCell>
                            <TableCell align='right'>Status</TableCell>
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
                                  {data.user_name}
                                </TableCell>
                                <TableCell align='right' style={{ verticalAlign: 'top' }}>
                                  {data.priority}
                                </TableCell>
                                <TableCell align='right' style={{ verticalAlign: 'top' }}>
                                  {data.approval_name}
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
                    </Box>
                  </Grid>
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
  action: 'manage',
  subject: 'audit-checklist-approval'
}

export default AuditIsoViewPage
