import { Card, CardContent, CardHeader, Grid, Skeleton, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { backendApi } from 'src/configs/axios'

const AuditInfo = props => {
  const { id } = props

  const [skeleton, setSkeleton] = useState(true)
  const [detail, setDetail] = useState([])

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
          setDetail(res.data.data)
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
  )
}

export default AuditInfo
