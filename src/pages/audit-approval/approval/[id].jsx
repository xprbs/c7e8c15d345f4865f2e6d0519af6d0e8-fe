import React, { useEffect, useLayoutEffect, useState } from 'react'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import Link from 'next/link'

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { backendApi } from 'src/configs/axios'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  Typography
} from '@mui/material'

import dynamic from 'next/dynamic'
import AuditInfo from 'src/views/pages/audit/AuditInfo'
import ApprovalList from 'src/views/pages/audit/ApprovalList'
import QuestionDetailView from 'src/views/pages/audit/QuestionDetailView'
import AuditorAuditee from 'src/views/pages/audit/AuditorAuditee'

var Editor = dynamic(() => import('src/views/editor/cke-editor'), {
  ssr: false
})

const AuditApproval = () => {
  const router = useRouter()
  const { id } = router.query

  const [isDisable, setIsDisable] = useState(false)
  const [isDisableReject, setIsDisableReject] = useState(false)
  const [isDisableApprove, setIsDisableApprove] = useState(false)
  const [note, setNote] = useState()

  const approveHandler = async => {
    setIsDisable(true)
    setIsDisableApprove(true)

    const dataForm = JSON.stringify({
      audit_uid: id,
      note: note
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/approval/approve', dataForm)
        .then(res => {
          router.push('/audit-approval')
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(e => {
          setIsDisable(false)
          setIsDisableApprove(false)
        })
    })

    toast.promise(myPromise, {
      loading: 'Loading',
      success: 'Successfully approved',
      error: error => {
        if (error.response.status === 500) return error.response.data.response

        return 'Something error'
      }
    })
  }

  const rejectHandler = async => {
    setIsDisable(true)
    setIsDisableReject(true)

    const dataForm = JSON.stringify({
      audit_uid: id,
      note: note
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/approval/reject', dataForm)
        .then(res => {
          router.push('/audit-approval')
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(e => {
          setIsDisable(false)
          setIsDisableReject(false)
        })
    })

    toast.promise(myPromise, {
      loading: 'Loading',
      success: 'Successfully reject',
      error: error => {
        if (error.response.status === 500) return error.response.data.response

        return 'Something error'
      }
    })
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>Detail Audit</Typography>}></PageHeader>
      </Grid>
      <AuditInfo id={id} />
      <AuditorAuditee id={id} />
      <ApprovalList id={id} />
      <QuestionDetailView id={id} />

      <Grid item md={12} xs={12}>
        <Card>
          <CardContent>
            <InputLabel sx={{ mb: 2 }}>
              <Typography variant='h6'>Note For Approval</Typography>
            </InputLabel>
            <FormControl fullWidth>
              <Editor
                name={'note'}
                initData={''}
                onCKChange={data => {
                  setNote(data)
                }}
              />
            </FormControl>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box
              sx={{
                gap: 5,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'left'
              }}
            >
              <Button component={Link} href={'/audit-approval'} variant='outlined' size='small'>
                Back
              </Button>
              <Button
                onClick={() => rejectHandler()}
                color='error'
                variant='contained'
                size='small'
                disabled={isDisable}
              >
                Reject
                {isDisableReject && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
              </Button>
              <Button onClick={() => approveHandler()} variant='contained' size='small' disabled={isDisable}>
                Approve
                {isDisableApprove && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

AuditApproval.acl = {
  action: 'manage',
  subject: 'audit-approval'
}

export default AuditApproval
