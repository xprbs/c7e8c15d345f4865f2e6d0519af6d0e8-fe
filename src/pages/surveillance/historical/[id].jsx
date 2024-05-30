/* eslint-disable react-hooks/rules-of-hooks */
// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { CircularProgress, CardContent, Skeleton, Icon } from '@mui/material'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import Link from 'next/link'

// ** Third Party Imports
import * as yup from 'yup'

import { useRouter } from 'next/router'
import { backendApi } from 'src/configs/axios'
import dynamic from 'next/dynamic'
import SurveillanceHistorical from 'src/views/pages/surveillance/SurveillanceHistorical'
import toast from 'react-hot-toast'

var Editor = dynamic(() => import('src/views/editor/cke-editor'), {
  ssr: false
})

const schema = yup.object().shape({
  question_answer_description: yup.string().required('Description is a required field'),
  question_answer_uid: yup.string().required('Answer Master is a required field')
})

const detailSurveillance = () => {
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>Surveillance Historical</Typography>} subtitle={null} />
      </Grid>
      <Grid item xs={12}>
        <SurveillanceHistorical id={id} />
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
                justifyContent: 'left',
                marginTop: 5
              }}
            >
              <Button component={Link} href={'/surveillance'} variant='outlined' size='small'>
                Back
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

detailSurveillance.acl = {
  action: 'manage',
  subject: 'surveillance-historical'
}

export default detailSurveillance
