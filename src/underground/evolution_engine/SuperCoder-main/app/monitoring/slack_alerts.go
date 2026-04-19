package monitoring

type SlackAlert struct {
	WebhookURL string
}

func NewSlackAlert() *SlackAlert {
	return &SlackAlert{}
}

func (s *SlackAlert) SendAlert(errorMessage string, metadata map[string]string) error {
	return nil
}
