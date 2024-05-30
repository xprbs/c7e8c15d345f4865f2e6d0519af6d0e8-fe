/* eslint-disable react-hooks/rules-of-hooks */
// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import {
  Skeleton,
} from '@mui/material'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'

// ** Third Party Imports
import * as yup from 'yup'

import { useRouter } from 'next/router'
import { backendApi } from 'src/configs/axios'
import dynamic from 'next/dynamic'
import SurveillanceDetail from 'src/views/pages/surveillance/SurveillanceDetail'

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

  const [skeleton, setSkeleton] = useState(true)
  const [skeleton2, setSkeleton2] = useState(true)
  const [isDisable, setIsDisable] = useState(false)
  const [dataSurveillance, setDataSurveillance] = useState([])

  const getData = async () => {
    setSkeleton(true)
    setSkeleton2(true)

    const dataForm = JSON.stringify({
      project_uid: id
    })

    new Promise((resolve, reject) => {
      backendApi
        .post('/web/surveillance/detail', dataForm)
        .then(res => {
          resolve('success')
          setDataSurveillance(res.data.data)
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

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>Surveillance Detail</Typography>} subtitle={null} />
        {skeleton ? (
          <Grid>
            <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
            <Skeleton variant='text' sx={{ fontSize: '3rem' }} />
          </Grid>
        ) : (
          <SurveillanceDetail detail={dataSurveillance} />
        )}
      </Grid>
    </Grid>
  )
}

detailSurveillance.acl = {
  action: 'manage',
  subject: 'surveillance-detail'
}

export default detailSurveillance
