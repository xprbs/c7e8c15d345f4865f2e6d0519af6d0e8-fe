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
import SurveillanceDetail from 'src/views/pages/surveillance/SurveillanceDetail'
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

  const [skeleton, setSkeleton] = useState(true)
  const [skeleton2, setSkeleton2] = useState(true)
  const [isDisable, setIsDisable] = useState(false)
  const [dataSurveillance, setDataSurveillance] = useState([])
  const [followupNote, setFollowupNote] = useState('')
  const [file, setFile] = useState(null)

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

  async function createHandler() {
    setIsDisable(true)

    const form = new FormData()

    form.append('dataAreaId', dataSurveillance.dataAreaId)
    form.append('project_uid', dataSurveillance.project_uid)
    form.append('file', file)
    form.append('doc_type', 30)
    form.append('note', followupNote)

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/surveillance/history', form, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then(res => {
          router.push('/surveillance')
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
        .finally(e => setIsDisable(false))
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

  const handleFile = target => {
    console.log(target.target.files[0])
    setFile(target.target.files[0])
  }

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>Surveillance Closed SHE</Typography>} subtitle={null} />
      </Grid>
      <Grid item xs={12}>
        {skeleton ? (
          <Grid>
            <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
            <Skeleton variant='text' sx={{ fontSize: '3rem' }} />
          </Grid>
        ) : (
          <SurveillanceDetail detail={dataSurveillance} />
        )}
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <TextField
              name={'followup_note'}
              multiline
              rows={3}
              fullWidth
              label='Note'
              size='small'
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 350, mt: 2 }}
              onChange={e => setFollowupNote(e.target.value)}
              defaultValue={followupNote}
            />
            <Button
              component='label'
              role={undefined}
              variant='contained'
              tabIndex={-1}
              startIcon={<Icon icon={'material-symbols:upload'} />}
              size='small'
              sx={{ marginTop: 5 }}
            >
              Upload file
              <input hidden type='file' accept='image/*' onChange={handleFile} />
            </Button>
            <Box>
              <Typography variant='overline' color={'primary'}>
                {file && file.name}
              </Typography>
            </Box>
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
              <Button variant='contained' size='small' disabled={isDisable} onClick={createHandler}>
                Close
                {isDisable && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
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
  subject: 'surveillance-closed'
}

export default detailSurveillance
