import React from 'react'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import Link from 'next/link'

// ** Third Party Imports
import { useRouter } from 'next/router'
import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material'
import ApprovalList from 'src/views/pages/audit/ApprovalList'
import AuditInfo from 'src/views/pages/audit/AuditInfo'
import QuestionDetailView from 'src/views/pages/audit/QuestionDetailView'
import AuditorAuditee from 'src/views/pages/audit/AuditorAuditee'

const AuditResultView = () => {
  const router = useRouter()
  const { id } = router.query

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>Result Audit</Typography>}></PageHeader>
      </Grid>
      <AuditInfo id={id} />
      <AuditorAuditee id={id} />
      <ApprovalList id={id} />
      <QuestionDetailView id={id} />

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={6}>
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
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

AuditResultView.acl = {
  action: 'manage',
  subject: 'audit-checklist-result'
}

export default AuditResultView
